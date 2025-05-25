export function Footer() {
  return (
    <footer className="py-8 bg-muted/80 border-t border-border">
      <div className="container px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold font-chakra mb-1">
            吵架<span className="text-primary">包赢</span><span className="text-accent">MAX</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            让你的每一次吵架都有回响
          </p>
          
          <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">使用指南</a>
            <span>|</span>
            <a href="#" className="hover:text-foreground transition-colors">关于我们</a>
            <span>|</span>
            <a href="#" className="hover:text-foreground transition-colors">隐私政策</a>
          </div>
          
          <p className="text-xs text-muted-foreground mt-6">
            © 2025 吵架包赢MAX - 技术支持
          </p>
        </div>
      </div>
    </footer>
  );
}