import { Html, Sky } from "@react-three/drei";
import "./Chapter1.css";

export default function Chapter1() {
  console.log("Chapter1 rendered");
  const lorem =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam sodales hendrerit. Ut velit mauris, egestas sed, gravida nec, ornare ut, mi. Aenean ut orci vel massa suscipit pulvinar. Nulla sollicitudin. Fusce varius, ligula non tempus aliquam, nunc turpis ullamcorper nibh, in tempus sapien eros vitae ligula. Pellentesque rhoncus nunc et augue. Integer id felis. Curabitur aliquet pellentesque diam. Integer quis metus vitae elit lobortis egestas. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Morbi vel erat non mauris convallis vehicula. Nulla et sapien. Integer tortor tellus, aliquam faucibus, convallis id, congue eu, quam. Mauris ullamcorper felis vitae erat. Proin feugiat, augue non elementum posuere, metus puru";

  return (
    <>
      <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0.6} azimuth={0.25} />
      <Html center transform distanceFactor={2.2}>
        <div className="container">
          <div className="chapter1-content">
            <div className="loader" role="img" aria-label="Animated polygon loader">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <defs>
                  <mask id="clipping">
                    <polygon points="0,0 100,0 100,100 0,100" fill="black"></polygon>
                    <polygon points="25,25 75,25 50,75" fill="white"></polygon>
                    <polygon points="50,25 75,75 25,75" fill="white"></polygon>
                    <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                    <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                    <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                    <polygon points="35,35 65,35 50,65" fill="white"></polygon>
                  </mask>
                </defs>
              </svg>
              <div className="box"></div>
            </div>
            <p className="chapter1-text">{lorem}</p>
          </div>
        </div>
      </Html>
    </>
  );
}
