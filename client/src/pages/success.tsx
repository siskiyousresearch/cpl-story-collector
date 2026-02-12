import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, Share2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Success() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 0.5 }} 
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="max-w-lg w-full text-center space-y-8 relative z-10"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
          className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"
        >
          <CheckCircle2 className="h-12 w-12" />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-4xl font-serif font-bold text-foreground">Thank You!</h1>
          <p className="text-lg text-muted-foreground">
            Your story has been submitted. It will help inspire countless other students on their educational journey.
          </p>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <h3 className="font-semibold mb-2 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-foreground" />
            What happens next?
          </h3>
          <p className="text-sm text-muted-foreground">
            Our team will do a final review. You'll receive a link to your published story via email within 24 hours.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
            <Link href="/">
                <Button variant="outline" size="lg" className="rounded-full">
                    <Home className="mr-2 h-4 w-4" />
                    Back Home
                </Button>
            </Link>
            <Button size="lg" className="bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all">
                <Share2 className="mr-2 h-4 w-4" />
                Share Link
            </Button>
        </div>
      </motion.div>
    </div>
  );
}
