const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");

const linha = 20;
const col = 10;
const sq = 20;
const quad = "WHITE";

// Desenhar os quadrados
function desenhaQuad(x,y,cor){
    ctx.fillStyle = cor;
    ctx.fillRect(x*sq,y*sq,sq,sq);

    ctx.strokeStyle = "BLACK";
    ctx.strokeRect(x*sq,y*sq,sq,sq);
}

// Cria o tabuleiro
let bord = [];
for( r = 0; r <linha; r++){
    bord[r] = [];
    for(c = 0; c < col; c++){
        bord[r][c] = quad;
    }
}
// Desenha o tabuleiro
function tab(){
    for( r = 0; r <linha; r++){
        for(c = 0; c < col; c++){
            desenhaQuad(c,r,bord[r][c]);
        }
    }
}
tab();

const pecas = [
    [Z,"red"],
    [S,"green"],
    [T,"yellow"],
    [O,"blue"],
    [L,"purple"],
    [I,"cyan"],
    [J,"orange"]
];

// gerar peças aleatórias
function geraPecas(){
    let r = randomN = Math.floor(Math.random() * pecas.length) // 0 -> 6
    return new Piece( pecas[r][0],pecas[r][1]);
}

let p = geraPecas();

function Piece(tetromino,cor){
    this.tetromino = tetromino;
    this.cor = cor;
    
    this.tetrominoN = 0; // Começa do primeiro padrão
    this.ativarTetromino = this.tetromino[this.tetrominoN];
    
    this.x = 3;
    this.y = -2;
}

// função de preenchimento
Piece.prototype.fill = function(cor){
    for( r = 0; r < this.ativarTetromino.length; r++){
        for(c = 0; c < this.ativarTetromino.length; c++){
            // we draw only occupied squares
            if( this.ativarTetromino[r][c]){
                desenhaQuad(this.x + c,this.y + r, cor);
            }
        }
    }
}

// Desenha
Piece.prototype.draw = function(){
    this.fill(this.cor);
}

// Apaga
Piece.prototype.unDraw = function(){
    this.fill(quad);
}

// Move para baixo
Piece.prototype.moveDown = function(){
    if(!this.colisao(0,1,this.ativarTetromino)){
        this.unDraw();
        this.y++;
        this.draw();
    }else{
        // Trava e gera uma nova
        this.lock();
        p = geraPecas();
    }
    
}
// Mover para a direita
Piece.prototype.moveRight = function(){
    if(!this.colisao(1,0,this.ativarTetromino)){
        this.unDraw();
        this.x++;
        this.draw();
    }
}
// Mover para a esquerda
Piece.prototype.moveLeft = function(){
    if(!this.colisao(-1,0,this.ativarTetromino)){
        this.unDraw();
        this.x--;
        this.draw();
    }
}
// Gira
Piece.prototype.rotate = function(){
    let novoPad = this.tetromino[(this.tetrominoN + 1)%this.tetromino.length];
    let kick = 0;
    
    if(this.colisao(0,0,novoPad)){
        if(this.x > col/2){
            kick = -1; 
        }else{
            kick = 1; 
        }
    }
    
    if(!this.colisao(kick,0,novoPad)){
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1)%this.tetromino.length; // (0+1)%4 => 1
        this.ativarTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

let score = 0;

Piece.prototype.lock = function(){
    for( r = 0; r < this.ativarTetromino.length; r++){
        for(c = 0; c < this.ativarTetromino.length; c++){
            if( !this.ativarTetromino[r][c]){
                continue;
            }
            if(this.y + r < 0){
                alert("Fim");
                gameOver = true;
                break;
            }
            bord[this.y+r][this.x+c] = this.cor;
        }
    }
    // Remove linhas inteiras
    for(r = 0; r < linha; r++){
        let islinhaFull = true;
        for( c = 0; c < col; c++){
            islinhaFull = islinhaFull && (bord[r][c] != quad);
        }
        if(islinhaFull){
            for( y = r; y > 1; y--){
                for( c = 0; c < col; c++){
                    bord[y][c] = bord[y-1][c];
                }
            }
            for( c = 0; c < col; c++){
                bord[0][c] = quad;
            }
            // Adiciona +10 aos pontos
            score += 10;
        }
    }
    // Atualiza o tab
    tab();
    
    // Atualiza a pontuação
    scoreElement.innerHTML = score;
}
// Função de colisão

Piece.prototype.colisao = function(x,y,piece){
    for( r = 0; r < piece.length; r++){
        for(c = 0; c < piece.length; c++){
            // Caso esteja vazio, pula
            if(!piece[r][c]){
                continue;
            }
            let newX = this.x + c + x;
            let newY = this.y + r + y;
            
            if(newX < 0 || newX >= col || newY >= linha){
                return true;
            }
            if(newY < 0){
                continue;
            }
            if( bord[newY][newX] != quad){
                return true;
            }
        }
    }
    return false;
}
// Controle

document.addEventListener("keydown",CONTROL);

function CONTROL(event){
    if(event.keyCode == 37){
        p.moveLeft();
        dropStart = Date.now();
    }else if(event.keyCode == 38){
        p.rotate();
        dropStart = Date.now();
    }else if(event.keyCode == 39){
        p.moveRight();
        dropStart = Date.now();
    }else if(event.keyCode == 40){
        p.moveDown();
    }
}
// Dropar as peças a cada 1 segundo.

let dropStart = Date.now();
let gameOver = false;
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > 1000){
        p.moveDown();
        dropStart = Date.now();
    }
    if( !gameOver){
        requestAnimationFrame(drop);
    }
}

drop();
