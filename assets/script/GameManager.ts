import { _decorator, AnimationComponent, Button, Camera, clamp, Component, director, game, instantiate, Label, Layout, LayoutComponent, math, Node, ParticleSystem2D, Prefab, ProgressBar, random, Scene, Script, size, Size, Sprite, UIOpacity, UITransform, Vec2, Vec3 } from 'cc';
import { Fruit } from './Fruit';
import { FruitCard } from './FruitCard';
import { FruitCustomer } from './FruitCustomer';
import { CameraController } from './CameraController';

const { ccclass, property } = _decorator;

enum game_state {
    SHOW_PLAYER_CARD,
    HIDE_CARDS,
    START_MATCHING,
    GAME_OVER,
    RESET_CARDS,
}


@ccclass('GameManager')
export class GameManager extends Component {
    @property(Number)
    // game mode defined how many row and column, will create a nxn grid of card
    public game_mode: number = 4; 
    
    private current_game_state: game_state = game_state.SHOW_PLAYER_CARD;

    @property(Number)
    public card_show_time: number = 30;
    private show_card_elasped_time: number = 0;

    // fruit card reference
    @property(Prefab)
    public fruit_card_prefab: Prefab;
    // reference to the card grid node
    @property(Node)
    public card_grid: Node;
    private spawned_card: number = 0;
    private fruit_cards: Node[] = [];
    private card_scale: number = 0;
    private card_cleared: number = 0;
    
    // private can_spawn_seller: boolean = true;
    @property(Node)
    public customer_node: Node;
    
    @property(Label)
    public score_label: Label;
    private score: number = 0;

    private player_level: number = 1;
    @property(ProgressBar)
    public progress_bar: ProgressBar;
    private player_reputation: number = 50;
    private reputation_title: string[] =[
       "Street Thug",
       "Corner Crew",
       "Back-Alley Enforcer",
       "Small-Time Operator",
       "Underworld Apprentice",
       "Racketeer Rookie",
       "Block Boss",
       "Smuggler's Syndicate",
       "Vice Kingpin",
       "Crime Lord's Lieutenant",
       "Enforcer Elite",
       "Syndicate Soldier",
       "Underboss Underling",
       "Cartel Commander",
       "Family Capo",
       "Clandestine Consigliere",
       "Heist Maestro",
       "Operation Overlord",
       "Crime",
    ]
    @property(Label)
    public player_reputattion_label: Label;
    @property(Label)
    public player_reputation_title_label: Label;
    private level_max_reputation: number = 100
    @property(Label)
    public player_level_label: Label;
    @property(Label)
    public show_card_time_left_label: Label;

    @property(Node)
    public camera_node: Node;

    @property(Node)
    public level_up_confetti: Node;

    // fruits in game
    private apple: Fruit = new Fruit("apple", 4);
    private banana: Fruit = new Fruit("pear", 3);
    private orange: Fruit = new Fruit("orange", 5);
    private grape: Fruit = new Fruit("watermelon", 10);
    private pineaple: Fruit = new Fruit("lemon", 8);
    private strawberry: Fruit = new Fruit("strawberry", 6);
    
    private fruit_available: Fruit[] = [
        this.apple,
        this.banana,
        this.orange,
        this.grape,
        this.pineaple,
        this.strawberry,
    ]
    
    // selected fruit for a round
    public selected_fruit_for_this_round: Fruit[] = [];
    
    private previous_selected_card: Node;
    private selected_card: Node;
    
    @property(Node)
    public game_over_node: Node;
    private game_over_screen_displayed: boolean = false;
    @property(Node)
    public game_over_score_label: Node;
    @property(Node)
    public game_over_particle: Node;

    @property(Node)
    public stock_now_button: Node;


    start() {
        this.update_score_label();
        this.update_player_level_label();
        this.update_reputation_bar();
        
        this.add_card();
       
        this.select_random_fruit(this.game_mode);
        this.reset_cards();
        this.update_score_label();
        
        // setup the fruit customer
        this.customer_node.getComponent(FruitCustomer).set_available_fruit(this.fruit_available);
        this.customer_node.getComponent(FruitCustomer).game_manager = this.node;
    }

    private shuffle_array(array_to_shuffle: Fruit[]): Fruit[] {
        for (let i = array_to_shuffle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array_to_shuffle[i], array_to_shuffle[j]] = [array_to_shuffle[j], array_to_shuffle[i]];
        }
        
        return array_to_shuffle;
    }

    // scale the card grid
    private calculate_card_scale(): number {
        // we only care about the horizontal size
        let spacing_x: number = this.card_grid.getComponent(Layout).spacingX;
        let card_size_x: number = 32 + spacing_x;
        let total_card_size_x: number = card_size_x * this.game_mode;
        let new_scale: number = 360 / total_card_size_x;

        // this.card_grid.scale = new Vec3(new_scale, new_scale, new_scale);
        return new_scale;
    }


    // select random number of fruit for each round
    public select_random_fruit(how_many_type: number): void {
        console.log("selecting random fruit for new round");
        let shuffled_fruit_availble: Fruit[] = this.shuffle_array(this.fruit_available.slice());
        this.selected_fruit_for_this_round = shuffled_fruit_availble.slice(0, how_many_type);
        console.log("selected fruit for this round " + this.selected_fruit_for_this_round);
    
    }

    // reset cards when each round id finish
    private reset_cards(): void {
        if(this.selected_fruit_for_this_round) {
            for (let i = 0; i < this.fruit_cards.length; i++) {
                if (i%this.game_mode == 0){
                    this.selected_fruit_for_this_round = this.shuffle_array(this.selected_fruit_for_this_round);
                }
                // assign fruit the the card
                // get the coressponding sprite frame
                // reset the rot rate
                this.fruit_cards[i].getComponent(FruitCard).set_assigned_fruit(this.selected_fruit_for_this_round[i%this.game_mode]);
                this.fruit_cards[i].getComponent(FruitCard).get_sprite_frame();
                this.fruit_cards[i].getComponent(FruitCard).get_animation_clip();
                this.fruit_cards[i].getComponent(FruitCard).reset_card();
            }

        }
    }
   
    // spawn card into card grid
    private add_card(): void {
        // setup the card grid
        // calculate the final scale of the grid, somehow cannot get the content size after adding cards
        this.card_scale = this.calculate_card_scale();
        this.card_grid.getComponent(Layout).constraintNum = this.game_mode;
        for (let i = 0; i < Math.pow(this.game_mode, 2); i++) {
            // instantiate a new card
            let new_fruit_card: Node = instantiate(this.fruit_card_prefab);
           
            // set the game manger on the fruit card
            new_fruit_card.getComponent(FruitCard).game_manager = this.node;

            new_fruit_card.scale = new Vec3(this.card_scale, this.card_scale, this.card_scale);

            // add to card grid
            this.card_grid.addChild(new_fruit_card);
            
            this.fruit_cards.push(new_fruit_card);
            this.spawned_card += 1
        }

        //somehow need to reset the axis direction or else the card positioning will be incorect
        this.card_grid.getComponent(Layout).startAxis = LayoutComponent.AxisDirection.VERTICAL;
    }

    // set the selected fruit card and compare with the previous selected one
    public set_selected_card(card: Node) {
        if (this.current_game_state == game_state.START_MATCHING) {
            this.selected_card = card;
            
            // if the previous selected card is null, means that it is a new round of selection
            if (this.previous_selected_card == null) {
                console.log("no previous selected card, waiting for next selected card")
                this.previous_selected_card = this.selected_card;
            } else {
                // if not, compare the fruit of the card
                // check whether the newly selected card is prvious one or not
                if(this.selected_card != this.previous_selected_card) {
                    let selected_card_assigned_fruit = this.selected_card.getComponent(FruitCard).assigned_fruit;
                    let previous_selected_card_assigned_fruit = this.previous_selected_card.getComponent(FruitCard).assigned_fruit;
                    if (selected_card_assigned_fruit == previous_selected_card_assigned_fruit) {
                        // if they are the same
                        console.log("its a match");
                        let perfect_fruit: number = 0;
                        // hide the card that is a match
                        this.selected_card.getComponent(FruitCard).hide_after_sucessful();
                        this.previous_selected_card.getComponent(FruitCard).hide_after_sucessful();
                        
                        // add fruit stock when it is a match when the fruit is not rotten
                        if (this.selected_card.getComponent(FruitCard).is_rotten == false) {
                            selected_card_assigned_fruit.add_stock(selected_card_assigned_fruit.fruit_value);
                            perfect_fruit += 1;
                        }
                        if (this.previous_selected_card.getComponent(FruitCard).is_rotten == false) {
                            previous_selected_card_assigned_fruit.add_stock(previous_selected_card_assigned_fruit.fruit_value);
                            perfect_fruit += 1;
                        }
                        
                        // remove 2 card
                        this.spawned_card -= 2;
                        this.card_cleared += 2;
                        this.increase_player_score(selected_card_assigned_fruit.fruit_value*perfect_fruit);

                        // reset the card when all the cards are matched
                        if (this.spawned_card <= 0) {
                            this.current_game_state = game_state.RESET_CARDS;
                        }
        
                    } else {
                        // if they are not the same
                        console.log("not a match")
                        // increase the rot rate of the fruit for unsucessful match
                        this.selected_card.getComponent(FruitCard).increase_rot();
                        this.previous_selected_card.getComponent(FruitCard).increase_rot();


                        this.selected_card.getComponent(FruitCard).hide_card();
                        this.previous_selected_card.getComponent(FruitCard).hide_card();

                        this.camera_node.getComponent(CameraController).apply_intensity(5, 4);
                    }
        
                    // reset the selected cards for next round
                    this.previous_selected_card = this.selected_card = null;
                    
                }
            }
        }
    }


    private update_score_label(): void {
        console.log("player score: " + this.score);
        this.score_label.string = "Score:  " + this.score.toString();

    }

    private update_player_level_label(): void {
        console.log("level up");
        this.player_level_label.string = "Level " + this.player_level;
        
    }

    private update_player_level_title(): void {
        let index: number = this.player_level - 1;
        index = clamp(index, 0, this.reputation_title.length-1);
        this.player_reputation_title_label.string = this.reputation_title[index]
        
    }

    public increase_player_score(amount: number): void {
        this.score += amount;
        this.update_score_label();
    }


    // shows the cards to player
    private show_all_cards(): void {
        this.fruit_cards.forEach(card => {
            card.getComponent(FruitCard).show_card();
        });
    }

    // hide all the cards
    private hide_all_card(): void {
        this.show_card_elasped_time = this.card_show_time;
        this.fruit_cards.forEach(card => {
            card.getComponent(FruitCard).start_game();
        });
    }
    
    // update the progress bar
    private update_reputation_bar(): void {
        console.log("reputation bar updated");
        // mod the player level so that it is in between 0 and max level
        let wrapped_progress: number = this.player_reputation%this.level_max_reputation
        this.progress_bar.progress = wrapped_progress/this.level_max_reputation;
        this.player_reputattion_label.string = "Reputation:  " + this.player_reputation.toString();

        this.update_player_level_label();
        this.update_player_level_title();
    }
    
    // increase player reputation
    public increase_player_reputation(amount: number) {
        console.log("reputation increased");
        this.player_reputation += amount;
        // wrapped progress
        if (this.player_reputation >= this.level_max_reputation * this.player_level) {
            this.player_level += 1
            this.level_up_confetti.getComponent(ParticleSystem2D).resetSystem();
        }
        this.update_reputation_bar();
    }

    // reduce the reputation
    public decrease_player_reputation(amount: number) {
        console.log("reputation decreased");
        this.player_reputation -= amount;
        if (this.player_reputation <= this.level_max_reputation * (this.player_level - 1)) {
            console.log("game over");
            this.current_game_state = game_state.GAME_OVER;
            return;
        }
        this.update_reputation_bar();
    }

    update(deltaTime: number) {
        this.decrease_player_reputation(5*deltaTime);
        switch(this.current_game_state) {
            // countdown to hide card, let player memorize the cards
            case game_state.SHOW_PLAYER_CARD:
                console.log("showing player cards");
                this.show_all_cards();
                this.show_card_elasped_time += deltaTime;
                this.show_card_time_left_label.string = (Math.round(this.card_show_time - this.show_card_elasped_time)).toString() + "s";
                if(this.show_card_elasped_time >= this.card_show_time) {
                    console.log("times up, hiding all cards");
                    this.current_game_state = game_state.HIDE_CARDS;
                }
                this.customer_node.getComponent(FruitCustomer).pause_countdown = true;
                break;
                    
            // hide all the game and let player start mactching
            case game_state.HIDE_CARDS:
                this.hide_all_card();
                this.customer_node.getComponent(FruitCustomer).can_order = true;
                this.customer_node.getComponent(FruitCustomer).set_available_fruit(this.selected_fruit_for_this_round);
                this.customer_node.getComponent(FruitCustomer).pause_countdown = false;
                this.current_game_state = game_state.START_MATCHING;
                break;

            //start matching
            case game_state.START_MATCHING:

                break
            
            // when all the cards are matched, reset the cards
            case game_state.RESET_CARDS:
                if (this.card_cleared > 50) {
                    console.log("50 cards cleared, increasing the size of grid");
                    this.game_mode += 2;
                    this.game_mode = clamp(this.game_mode, 2, 6);
                    this.fruit_cards = [];
                    this.card_grid.destroyAllChildren();
                    this.add_card();
                    this.card_cleared = 0;

                    this.select_random_fruit(this.game_mode);
                }
                
                console.log("all cards has been matched, resetting the card");
                this.reset_cards();
                console.log("resetting done, showing player card");
                this.show_card_elasped_time = 0
                this.spawned_card = this.fruit_cards.length;
                this.current_game_state = game_state.SHOW_PLAYER_CARD;
                break;

            // when game over show the game over scene
            case game_state.GAME_OVER:
                // show the game over node
                if (this.game_over_screen_displayed == false) {
                    this.camera_node.getComponent(CameraController).apply_intensity(10, 8);
                    this.game_over_node.getComponent(AnimationComponent).play();
                    
                    this.fruit_cards.forEach(card => {
                        card.getComponent(FruitCard).monitor_touch = false;
                        card.getComponent(FruitCard).game_over_splash();

                    });

                    this.stock_now_button.getComponent(Button).interactable = false;

                    //set score on the game over screen
                    this.game_over_score_label.getComponent(Label).string = this.score.toString();

                    this.game_over_particle.children.forEach(child => {
                        child.getComponent(ParticleSystem2D).resetSystem();
                    }) 
                    
                    this.game_over_screen_displayed = true;
                }

            

        }
        
    }
}


