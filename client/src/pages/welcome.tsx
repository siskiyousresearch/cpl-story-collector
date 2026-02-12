import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Mic, Sparkles } from "lucide-react";
import heroImage from "@assets/generated_images/diverse_students_sharing_stories_illustration.png";
import { motion } from "framer-motion";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif text-xl font-bold text-primary">
            <BookOpen className="h-6 w-6" />
            <span>StoryCollector</span>
          </div>
          <Button variant="ghost" size="sm">Login</Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>Share your journey with the world</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight text-foreground">
              Your Story Can <span className="text-primary">Inspire Others</span>
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              You've just earned Credit for Prior Learning (CPL) - congratulations! Your work experience, military service, or certifications have become college credits. Now, help us inspire other students by sharing your CPL journey.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/interview">
                <Button size="lg" className="rounded-full px-8 h-12 text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                  Share Your Story
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="rounded-full h-12 text-lg">
                <Mic className="mr-2 h-5 w-5" />
                How it works
              </Button>
            </div>

            <div className="pt-8 flex items-center gap-8 text-sm text-muted-foreground">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="Avatar" />
                  </div>
                ))}
              </div>
              <p>Join 40+ students who have already shared.</p>
            </div>
          </motion.div>

          {/* Right Column: Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-3xl blur-3xl -z-10" />
            <img 
              src={heroImage} 
              alt="Students sharing stories" 
              className="rounded-3xl shadow-2xl w-full object-cover aspect-[4/3] border-4 border-white"
            />
            
            {/* Floating Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-muted max-w-[240px] hidden md:block"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="font-semibold text-sm">AI Assisted</div>
              </div>
              <p className="text-xs text-muted-foreground">
                "The process was so easy. I just answered a few questions and it wrote a beautiful story for me."
              </p>
            </motion.div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
