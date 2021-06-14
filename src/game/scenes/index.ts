import { BootScene } from './boot-scene';
import { GameScene } from './game-scene';
import MenuScene from './MenuScene';
import PauseScene from './PauseScene';
import PlayScene from './PlayScene';
import PreloadScene from './PreloadScene';
import ScoreScene from './ScoreScene';

const WIDTH = 400;
const HEIGHT = 600;
const GOTCHI_POSITION = {
  x: WIDTH / 10, y: HEIGHT /2
};

const SHARED_CONFIG = {
  width: WIDTH,
  height: HEIGHT,
  startPosition: GOTCHI_POSITION
}

const scenes = [BootScene, PreloadScene, MenuScene, ScoreScene, PlayScene, PauseScene];
const createScene = Scene => new Scene(SHARED_CONFIG);
const initScenes = () => Scenes.map(createScene);

export default scenes;

const config = {
    type: Phaser.AUTO,
    ...SHARED_CONFIG,
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        // debug: true
      }
    },
    scene: initScenes()
  }
  
  new Phaser.Game(config);
