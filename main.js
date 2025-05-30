/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas')
const renderer = canvas.getContext('2d')
renderer.imageSmoothingEnabled = false;

var laatst = 0;
var deltaTime = 0;

var pos = [0, 0]
var random = 0;

// Assets
var gras1 = new Image(45, 45)
var gras2 = new Image(45, 45)
gras1.src = "gras1.png"
gras2.src = "gras2.png"

var enemypos = {x:0, y:0}
var beurt = false;
var laatstpos = ''
/** @type {WebSocket} */
var server;

function connect()
{
    document.getElementById("connect").remove()
    server = new WebSocket("wss://85.148.53.54:8080");
    server.onerror = () => {location.reload();}
    server.onmessage = async (event) => {
        var tekst = event.data
        if (event.data instanceof Blob) {
            const arrayBuffer = await event.data.arrayBuffer();
            const uint8array = new Uint8Array(arrayBuffer);
            tekst = new TextDecoder().decode(uint8array);
        }

        const data = JSON.parse(tekst);
        if (data.type == "beurt") {beurt = true}
        else if (data.type == "pos")
        {
            enemypos.x = data.x
            enemypos.y = data.y
        }
    }
}

function gooi()
{
    if (beurt)
    {
        beurt = false
        random = Math.floor(Math.random() * 6) + 1
        document.getElementById("gooi").textContent = random
    }
}

const map = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 1, 3, 3, 1, 3, 1],
  [1, 1, 1, 1, 2, 1, 3, 1],
  [1, 2, 3, 1, 1, 1, 2, 1],
  [1, 1, 1, 1, 3, 3, 2, 1],
  [3, 3, 3, 1, 1, 1, 1, 1]
];

window.addEventListener('keydown', (data) => {
    if (random != 0)
    {
        if (data.key == 'ArrowRight' && map[pos[1]][pos[0] + 1] == 1 && laatstpos != 'ArrowLeft')
        {
            pos[0]++;
            random--;
            laatstpos = data.key;
            document.getElementById("gooi").textContent = random
            server.send(JSON.stringify({type:"pos", x: pos[0], y: pos[1]}))
            if (random == 0)
            {
                document.getElementById("gooi").textContent = "gooi"
                server.send(JSON.stringify({type:"beurt"}))
            }
        }
        else if (data.key == 'ArrowLeft' && map[pos[1]][pos[0] - 1] == 1 && laatstpos != 'ArrowRight')
        {
            pos[0]--;
            random--;
            laatstpos = data.key;
            document.getElementById("gooi").textContent = random
            server.send(JSON.stringify({type:"pos", x: pos[0], y: pos[1]}))
            if (random == 0)
            {
                document.getElementById("gooi").textContent = "gooi"
                server.send(JSON.stringify({type:"beurt"}))
            }
        }
        else if (data.key == 'ArrowUp' && map[pos[1] - 1][pos[0]] == 1 && laatstpos != 'ArrowDown')
        {
            pos[1]--;
            random--;
            laatstpos = data.key;
            document.getElementById("gooi").textContent = random
            server.send(JSON.stringify({type:"pos", x: pos[0], y: pos[1]}))
            if (random == 0)
            {
                document.getElementById("gooi").textContent = "gooi"
                server.send(JSON.stringify({type:"beurt"}))
            }
        }
        else if (data.key == 'ArrowDown' && map[pos[1] + 1][pos[0]] == 1 && laatstpos != 'ArrowUp')
        {
            pos[1]++;
            random--;
            laatstpos = data.key;
            document.getElementById("gooi").textContent = random
            server.send(JSON.stringify({type:"pos", x: pos[0], y: pos[1]}))
            if (random == 0)
            {
                document.getElementById("gooi").textContent = "gooi"
                server.send(JSON.stringify({type:"beurt"}))
            }
        }
    }
})

// window.addEventListener('keyup', (data) => {

// })

function Logic()
{
}

function Draw()
{
    renderer.fillStyle = 'grey'
    renderer.clearRect(0, 0, canvas.width, canvas.height);
    for (var y = 0; y < 6; y++) {
        for (var x = 0; x < 8; x++) {
            if (map[y][x] == 1) {renderer.fillRect(x * 180, y * 180, 180, 180)}
            else if (map[y][x] == 2) {renderer.drawImage(gras1, x * 180, y * 180, 180, 180)}
            else if (map[y][x] == 3) {renderer.drawImage(gras2, x * 180, y * 180, 180, 180)}
        }
    }
    renderer.fillStyle = 'blue'
    renderer.fillRect(180 / 2 - 45 + (180 * enemypos.x), 180 / 2 - 45 + (180 * enemypos.y), 90, 90);
    renderer.fillStyle = 'red'
    renderer.fillRect(180 / 2 - 45 + (180 * pos[0]), 180 / 2 - 45 + (180 * pos[1]), 90, 90);
}

function loop(nu)
{
    deltaTime = (nu - laatst) / 1000;
    laatst = nu;

    Logic();
    Draw();

    requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
