import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import Features from "./components/Features";
import Analytics from "./components/Analytics";
import Footer from "./components/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <Features />
      <Analytics />
      <Footer/>
    </div>
  );
};

export default LandingPage;
