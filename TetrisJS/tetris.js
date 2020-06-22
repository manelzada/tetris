const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");

const linha = 20;
const coluna = 10;
const Quad = 20;
const VACANT = "aqua"; // cor dos quadrados

// desenha o Quad
function drawQuad(x,y,cor){
    ctx.fillStyle = cor;
    ctx.fillRect(x*Quad,y*Quad,Quad,Quad);

    ctx.strokeStyle = "BLACK";
    ctx.strokeRect(x*Quad,y*Quad,Quad,Quad);
}

// Cria o tabuleiro

let board = [];
for( r = 0; r <linha; r++){
    board[r] = [];
    for(c = 0; c < coluna; c++){
        board[r][c] = VACANT;
    }
}

// Desenha o tabuleiro
function drawBoard(){
    for( r = 0; r <linha; r++){
        for(c = 0; c < coluna; c++){
            drawQuad(c,r,board[r][c]);
        }
    }
}

drawBoard();

const peças = [
    [Z,"red"],
    [S,"green"],
    [T,"yellow"],
    [O,"blue"],
    [L,"purple"],
    [I,"cyan"],
    [J,"orange"]
];

// Gera as peças

function randomPiece(){
    let r = randomN = Math.floor(Math.random() * peças.length) // 0 -> 6
    return new Piece( peças[r][0],peças[r][1]);
}

let p = randomPiece();

function Piece(tetromino,cor){
    this.tetromino = tetromino;
    this.cor = cor;
    
    this.tetrominoN = 0; // Começa do primeiro
    this.activeTetromino = this.tetromino[this.tetrominoN];
    
    this.x = 3;
    this.y = -2;
}

// Função de preenchimento

Piece.prototype.fill = function(cor){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // Desenha apenas quadrados ocupados
            if( this.activeTetromino[r][c]){
                drawQuad(this.x + c,this.y + r, cor);
            }
        }
    }
}

// Desenha no quadro

Piece.prototype.draw = function(){
    this.fill(this.cor);
}

// Apaga uma peça

Piece.prototype.unDraw = function(){
    this.fill(VACANT);
}

// Move a peça pra baixo

Piece.prototype.moveDown = function(){
    if(!this.colisão(0,1,this.activeTetromino)){
        this.unDraw();
        this.y++;
        this.draw();
    }else{
        // Trava a peça e gera uma nova
        this.lock();
        p = randomPiece();
    }
    
}

// Mover para a direita
Piece.prototype.moveRight = function(){
    if(!this.colisão(1,0,this.activeTetromino)){
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// Mover para a esquerda
Piece.prototype.moveLeft = function(){
    if(!this.colisão(-1,0,this.activeTetromino)){
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// Girar
Piece.prototype.rotate = function(){
    let nextPattern = this.tetromino[(this.tetrominoN + 1)%this.tetromino.length];
    let kick = 0;
    
    if(this.colisão(0,0,nextPattern)){
        if(this.x > coluna/2){
            // Parede direita
            kick = -1;
        }else{
            // Parede Esqurda
            kick = 1;
        }
    }
    
    if(!this.colisão(kick,0,nextPattern)){
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1)%this.tetromino.length; // (0+1)%4 => 1
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

let score = 0;

Piece.prototype.lock = function(){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            if( !this.activeTetromino[r][c]){
                continue;
            }
            // Quando chegar no topo = game over
            if(this.y + r < 0){
                alert("Game Over");
                // Para a animação
                gameOver = true;
                break;
            }
            // Trava a peça
            board[this.y+r][this.x+c] = this.cor;
        }
    }
    // Remover linha inteira
    for(r = 0; r < linha; r++){
        let isRowFull = true;
        for( c = 0; c < coluna; c++){
            isRowFull = isRowFull && (board[r][c] != VACANT);
        }
        if(isRowFull){
            // Se a linha estiver cheia
            // Todas as linhas se movem pra baixo
            for( y = r; y > 1; y--){
                for( c = 0; c < coluna; c++){
                    board[y][c] = board[y-1][c];
                }
            }
            for( c = 0; c < coluna; c++){
                board[0][c] = VACANT;
            }
            // Aumenta score em +10
            score += 10;
        }
    }
    // Atualiza a borda
    drawBoard();
    
    // Atualiza score
    scoreElement.innerHTML = score;
}

// Função de colisão

Piece.prototype.colisão = function(x,y,piece){
    for( r = 0; r < piece.length; r++){
        for(c = 0; c < piece.length; c++){
            // Se estiver vazio, pule
            if(!piece[r][c]){
                continue;
            }
            // coordenadas das peças antes de se mover
            let newX = this.x + c + x;
            let newY = this.y + r + y;
            
            // condições
            if(newX < 0 || newX >= coluna || newY >= linha){
                return true;
            }
            if(newY < 0){
                continue;
            }
            // verifique se há uma peça no local
            if( board[newY][newX] != VACANT){
                return true;
            }
        }
    }
    return false;
}

// controle

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

// Peça cai a cada 1 segundo

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



















