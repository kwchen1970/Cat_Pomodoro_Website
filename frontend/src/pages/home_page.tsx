import catGif from "../assets/cat1.gif";
import Buttons from "../components/Start_Button";
import LogIn from "../components/Login_Button";

const Home = () => {
  return (
    <div className="bg-cream min-vh-100 min-vw-100">
      <div className="d-flex justify-content-end me-4 mt-4">
        <LogIn />
      </div>
      <div className="d-flex flex-column justify-content-center align-items-center gap-4">
        <h4 className="text-dark fs-1">Ready to Focus?</h4>
        <Buttons />
        <img src={catGif} alt="focus animation" className="img-fluid" />
      </div>
    </div>
  );
};

export default Home;