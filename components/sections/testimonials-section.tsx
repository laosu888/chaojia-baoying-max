export function TestimonialsSection() {
  return (
    <section id="testimonials-section" className="py-20 bg-muted/20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            用户心声
          </h2>
          <p className="text-lg text-muted-foreground">
            各行各业的用户都在使用吵架包赢MAX
          </p>
        </motion.div>
      </div>
    </section>
  );
} 