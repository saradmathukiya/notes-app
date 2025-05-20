import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { FaMagic } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { FaPenFancy } from "react-icons/fa";
import { FaTheaterMasks } from "react-icons/fa";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to notes if already logged in
  useEffect(() => {
    if (user) {
      navigate("/notes");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-purple-700 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              AI-Powered Notes
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Enhance your writing with artificial intelligence. Create, organize, and improve your notes with powerful AI features.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="px-8 bg-white text-purple-600 hover:bg-gray-100 hover:text-purple-800">
                <Link to="/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/20 text-white hover:text-white">
                <Link to="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful AI Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              title="Summarize Content" 
              description="Generate concise summaries of your notes with a single click."
              icon={<FaMagic className="w-8 h-8 text-purple-600" />}
            />
            <FeatureCard 
              title="Fix Grammar" 
              description="Automatically correct grammar, spelling, and punctuation errors."
              icon={<FaCheck className="w-8 h-8 text-purple-600" />}
            />
            <FeatureCard 
              title="Improve Writing" 
              description="Enhance clarity, tone, and overall quality of your writing."
              icon={<FaPenFancy className="w-8 h-8 text-purple-600" />}
            />
            <FeatureCard 
              title="Change Style" 
              description="Transform your content to match formal, casual, or academic styles."
              icon={<FaTheaterMasks className="w-8 h-8 text-purple-600" />}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your notes?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have improved their writing and productivity with our AI-powered notes app.
          </p>
          <Button asChild size="lg" className="px-8 bg-white text-purple-600 hover:bg-gray-100 hover:text-purple-800">
            <Link to="/register">Create Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm">© 2025 AI-Powered Notes. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ title, description, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Home; 