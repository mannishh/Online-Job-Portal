import { motion } from "framer-motion";
import { ArrowRight, Search, Users, Building2, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const HeroSection = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // const stat = [
  //   { icon: Users, label: "Active Users", value: 1000 },
  //   { icon: Building2, label: "Companies", value: 500 },
  //   { icon: TrendingUp, label: "Jobs Posted", value: 2000 },
  // ];

  return (
    <section className="pt-24 pb-16 bg-white min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight pt-10"
          >
            Find Your Dream Job or
            <span className="block bg-linear-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent mt-2">
              Perfect Hire
            </span>
          </motion.h1>

          {/* sub heading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Connect talented professionals with innovative companies. Your next
            career move or perfect candidate is just one click away.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-linear-to-r from-pink-400 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 "
              onClick={() => navigate("/find-jobs")}
            >
              <Search className="w-5 h-5" />
              <span>Find Jobs</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
              onClick={() => {
                navigate(
                  isAuthenticated && user?.role === "employer"
                    ? "/employer-dashboard"
                    : "/login"
                );
              }}
            >
              Post a Job
            </motion.button>
          </motion.div>

          {/* stats */}
          {/* <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="">
              <stat.icon className="" />
            </div>
            <div className=""> {stat.value}</div>
            <div className="">{stat.label}</div>
          </motion.div> */}
        </div>
      </div>

      {/* subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-r from-pink-50 to-purple-50 rounded-full blur-3xl opacity-20" />
      </div>
    </section>
  );
};

export default HeroSection;
