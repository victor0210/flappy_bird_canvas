/**
 * Created by humengtao on 2016/12/9.
 */
$(function () {
    //    const land=new Image();
    //    land.src="./flappybird/land.png";  here is the same way to create a img for HTML_Node;

    //    find imgs from dom
    const land = document.getElementById('land');
    const background = document.getElementById('back');
    const pipe_up = document.getElementById('pipe_up');
    const pipe_down = document.getElementById('pipe_down');
    const game_over = document.getElementById('game_over');
    const game_start = document.getElementById('game_start');
    const new_game = document.getElementById('new_game');
    const sound1 = document.getElementById('sound1');
    const sound2 = document.getElementById('sound2');
    const sound3 = document.getElementById('sound3');
    const tab_start = document.getElementById('tab_start');

    //    define class bird
    class Bird {
        constructor() {

//            bird vertical position
            this.positionY = 250;

//            bird horizon position
            this.positionX = 200;

//            bird speed of vertical
            this.vY = 0;

//            acceleration
            this.aY = 0.15;
        }

        fall() {
            this.positionY += this.vY;
        }

        setSpeed(v0, a, t) {
            this.vY = v0 + a * t;
        }
    }

    //    define class pipe
    class Pipe {
        constructor(positionX, topHeight, bottomHeight) {
//            pipe horizon position
            this.positionX = positionX;

//            height of top pipe
            this.topHeight = topHeight;

//            height of bottom pipe
            this.bottomHeight = bottomHeight;

//            direction of pipe move (up or down)
            this.moveTo = [1, -1][~~(Math.random() * 2)];

//            max distance of moving
            this.distance = 40;

//            record distance of having moved
            this.pipeDistance = 0;

//            speed of pipe move
            this.speed = [0.1, 0.2, 0.3][~~(Math.random() * 3)];
        }
    }

    //    define class game
    class Game {
        constructor() {
//            all pipes
            this.pipes = [];
            this.i = 1;

//            flag of bird img change
            this.flag = 1;

//            flag for background
            this.startX = 0;
            this.score = 0;
        }

        init() {
            const cas = document.getElementById('canvas');
            const cxt = cas.getContext('2d');

            const bird = new Bird();

            $('#record span').text(localStorage.getItem('flappy_bird_best_record'));

            this.gameReady(cxt, bird);
        }

//        change state to ready for game
        gameReady(cxt, bird) {
            const _this = this;
            let getReady = setInterval(()=> {

                cxt.clearRect(0, 0, 1200, 800);

//                draw init sense
                _this.drawBackground(cxt);
                _this.drawLand(cxt);
                _this.drawBird(cxt, bird);
                _this.drawScore(cxt);

//                img for game ready
                cxt.drawImage(game_start, 618, 199, 204, 54);
                cxt.drawImage(tab_start, 663, 270, 114, 98);
            }, 1);

            $(document).on('keydown', ()=> {
                clearInterval(getReady);
                $(document).off('keydown');
                bird.vY = -1.2;

//                start game
                _this.gameStart(cxt, bird);
            });
        }

        gameStart(cxt, bird) {

//            initial time
            let t = 0;
            const _this = this;

//            add pipe for each one second
            let addPipe = setInterval(()=> {
                const topHeight = ~~(Math.random() * 100) + 80;
                _this.pipes.push(new Pipe(1440, topHeight, 300 - topHeight));
            }, 1000);

//            set bird speed with increasing time
            let changeSpeed = setInterval(()=> {
                bird.setSpeed(bird.vY, bird.aY, t);
                t++;
            }, 100);

//            giving the bird a raising speed when tab
            $(document).on('keydown', ()=> {
                sound3.currentTime = 0;
                sound3.play();
                t = 0;
                bird.vY = -0.6;
            });

//            draw everything
            let runGame = setInterval(()=> {
                cxt.clearRect(0, 0, 1200, 800);

                _this.drawBackground(cxt);
                _this.drawPipe(cxt);
                _this.drawLand(cxt);
                _this.drawBird(cxt, bird);
                _this.drawScore(cxt);
                bird.fall();
            }, 1);

//            check the game if end
            let check = setInterval(()=> {

//                clear all interval if the game is end
                if (_this.checkEnd(bird)) {
                    clearInterval(addPipe);
                    clearInterval(changeSpeed);
                    clearInterval(runGame);
                    clearInterval(check);
                    $(document).off('keydown');
                    _this.gameOver(cxt);
                }
                _this.setScore(bird);
            }, 1);
        }

        setScore(bird) {
            if (!!this.pipes[this.score]) {
                if (bird.positionX - 13 > this.pipes[this.score].positionX + 52) {
                    sound1.currentTime = 0;
                    sound1.play();
                    this.score++;
                }
            }
        }

        drawScore(cxt) {
            if (this.score < 10) {
                let img = document.getElementById('score_' + this.score);
                cxt.drawImage(img, 720, 20, 16, 20);
            } else if (this.score >= 10) {
                let img1 = document.getElementById('score_' + (~~(this.score / 10)));
                let img2 = document.getElementById('score_' + this.score % 10);
                cxt.drawImage(img1, 705, 20, 16, 20);
                cxt.drawImage(img2, 735, 20, 16, 20);
            } else if (this.score >= 100) {
                let img1 = document.getElementById('score_' + (~~(this.score / 10)));
                let img2 = document.getElementById('score_' + this.score % 10);
                let img3 = document.getElementById('score_' + this.score % 10);
                cxt.drawImage(img1, 690, 20, 16, 20);
                cxt.drawImage(img2, 720, 20, 16, 20);
                cxt.drawImage(img3, 750, 20, 16, 20);
            }
        }

        gameOver(cxt) {
            const _this = this;
            sound2.play();

//            set local record
            if (!localStorage.getItem('flappy_bird_best_record')||this.score>localStorage.getItem('flappy_bird_best_record'))
                localStorage.setItem('flappy_bird_best_record', this.score);

//            draw img of gameover
            cxt.drawImage(game_over, 618, 199, 204, 54);
            cxt.drawImage(new_game, 688, 269, 64, 28);

//            bind event of tabing to restart
            $(document).on('keydown', ()=> {
                $(document).off('keydown');
                _this.restartGame();
            });
        }

        restartGame() {
//            clear all attrs
            this.pipes = [];
            this.startX = 0;
            this.i = 1;
            this.flag = 1;
            this.score = 0;

//            restart
            this.init();
        }

        checkEnd(bird) {
            let isEnd = false;
            if (bird.positionY + 13 > 400) {
                isEnd = true;
            }
            if (!!this.pipes[this.score]) {
                if (bird.positionX + 13 >= this.pipes[this.score].positionX && bird.positionX - 13 <= this.pipes[this.score].positionX + 52) {
                    if (bird.positionY + 13 >= 400 - this.pipes[this.score].bottomHeight || bird.positionY - 13 <= this.pipes[this.score].topHeight) {
                        isEnd = true;
                    }
                }
            }

            return isEnd;
        }

        drawBird(cxt, bird) {
            cxt.beginPath();
            let img = document.getElementById('bird' + this.i);

            if (this.flag == 1) {
                this.i += 1;
            } else {
                this.i -= 1;
            }

            if (this.i == 3 || this.i == 1) {
                this.flag /= -1;
            }
            cxt.drawImage(img, bird.positionX - 24, bird.positionY - 24, 48, 48);
            cxt.closePath();
        }


        drawLand(cxt) {

            cxt.drawImage(land, this.startX, 400, 288, 112);
            cxt.drawImage(land, this.startX + 288, 400, 288, 112);
            cxt.drawImage(land, this.startX + 288 * 2, 400, 288, 112);
            cxt.drawImage(land, this.startX + 288 * 3, 400, 288, 112);
            cxt.drawImage(land, this.startX + 288 * 4, 400, 288, 112);
            cxt.drawImage(land, this.startX + 288 * 5, 400, 288, 112);
            cxt.drawImage(land, this.startX + 288 * 6, 400, 288, 112);
            this.startX--;
            if (this.startX <= -288) {
                this.startX = 0;
            }
        }

        drawPipe(cxt) {

            this.pipes.map((el)=> {
                cxt.drawImage(pipe_down, el.positionX, el.topHeight - 320, 52, 320);
                cxt.drawImage(pipe_up, el.positionX, 400 - el.bottomHeight, 52, 320);
                el.positionX--;

                if (el.moveTo == 1) {
                    el.topHeight += el.speed;
                    el.bottomHeight -= el.speed;
                } else {
                    el.topHeight -= el.speed;
                    el.bottomHeight += el.speed;
                }

                el.pipeDistance += el.speed;
                if (el.pipeDistance >= el.distance) {
                    el.pipeDistance = 0;
                    el.moveTo /= -1;
                }
            });
        }

        drawBackground(cxt) {

            cxt.drawImage(background, this.startX, 0, 288, 512);
            cxt.drawImage(background, this.startX + 288, 0, 288, 512);
            cxt.drawImage(background, this.startX + 288 * 2, 0, 288, 512);
            cxt.drawImage(background, this.startX + 288 * 3, 0, 288, 512);
            cxt.drawImage(background, this.startX + 288 * 4, 0, 288, 512);
            cxt.drawImage(background, this.startX + 288 * 5, 0, 288, 512);
            cxt.drawImage(background, this.startX + 288 * 6, 0, 288, 512);
            this.startX--;
            if (this.startX <= -288) {
                this.startX = 0;
            }
        }
    }

    (function ($) {
        $.fn.startGame = function () {
            return new Game().init();
        };
    })(jQuery)
});