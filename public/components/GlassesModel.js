import { useGLTF } from '@react-three/drei';

export default function GlassesModel() {
  const { scene } = useGLTF('/models/sunglasses.glb'); // Load 3D sunglasses
  return <primitive object={scene} scale={1.2} />;
}
