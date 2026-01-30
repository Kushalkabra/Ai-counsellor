import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const footerLinks = {
  Product: [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Get Started", href: "/login", isRoute: true },
  ],
  Company: [
    { name: "About Us", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Privacy Policy", href: "#" },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2"
          >
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
              >
                <GraduationCap className="h-5 w-5" />
              </motion.div>
              <span className="text-lg font-bold">AI Counsellor</span>
            </Link>
            <p className="text-background/60 max-w-sm">
              Your AI-powered companion for navigating the study abroad journey. 
              From profile to admission, we guide every step.
            </p>
          </motion.div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (categoryIndex + 1) * 0.1 }}
            >
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-3 text-background/60">
                {links.map((link) => (
                  <motion.li
                    key={link.name}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {link.isRoute ? (
                      <Link to={link.href} className="hover:text-background transition-colors">
                        {link.name}
                      </Link>
                    ) : (
                      <a href={link.href} className="hover:text-background transition-colors">
                        {link.name}
                      </a>
                    )}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-8 border-t border-background/10 text-center text-background/40 text-sm"
        >
          © {new Date().getFullYear()} AI Counsellor. All rights reserved.
        </motion.div>
      </div>
    </footer>
  );
};
