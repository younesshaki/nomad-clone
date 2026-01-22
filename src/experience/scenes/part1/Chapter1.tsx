import { Sky, Text } from "@react-three/drei";

export default function Chapter1() {
  console.log("Chapter1 rendered");
  return (
    <>
      <Sky distance={1000} sunPosition={[0, 1, 0]} inclination={0.6} azimuth={0.25} />
      <Text
        position={[0, 0, 0]}
        fontSize={0.6}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Chapter One
      </Text>
    </>
  );
}
