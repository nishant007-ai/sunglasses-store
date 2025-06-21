import { Canvas } from '@react-three/fiber';
import GlassesModel from './components/GlassesModel';

function App() {
  return (
    <div>
      <h1>Virtual Try-On for Sunglasses</h1>
      <Canvas>
        <GlassesModel />
      </Canvas>
    </div>
  );
}

export default App;
