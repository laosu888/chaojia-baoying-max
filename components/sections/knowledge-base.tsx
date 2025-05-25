'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Brain, BookOpen, Lightbulb, List } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

export function KnowledgeBase() {
  const [openSection, setOpenSection] = useState<string | null>('what-is-quality');
  
  return (
    <section className="py-16 bg-background bg-grid">
      <div className="container px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-chakra mb-2">
            吵架<span className="text-accent_green">宝典</span>
          </h2>
          <p className="text-muted-foreground">
            掌握高质量吵架的精髓
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion
            type="single"
            collapsible
            value={openSection || undefined}
            onValueChange={(value) => setOpenSection(value)}
            className="space-y-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <AccordionItem value="what-is-quality" className="tech-card border-none">
                <AccordionTrigger className="text-lg font-bold">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-accent_orange" />
                    什么是高质量的吵架？
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-foreground/90 space-y-3 pt-2">
                  <p>
                    高质量的吵架不是简单的谩骂和人身攻击，而是一种能够在维护自身立场的同时，展现逻辑思维和语言技巧的艺术。它包含以下要素：
                  </p>
                  
                  <ul className="list-disc pl-5 space-y-1">
                    <li>清晰的论点和有力的论据</li>
                    <li>合理的逻辑推理过程</li>
                    <li>恰到好处的修辞和类比</li>
                    <li>适当的情感表达</li>
                    <li>对对方观点的精准反驳</li>
                  </ul>
                  
                  <p>
                    一场高质量的吵架应该是一次思维的交锋，而非情绪的宣泄。
                  </p>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <AccordionItem value="techniques" className="tech-card border-none">
                <AccordionTrigger className="text-lg font-bold">
                  <div className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-primary" />
                    核心技巧：节奏、反问、类比
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-foreground/90 space-y-3 pt-2">
                  <div>
                    <h4 className="font-bold mb-1">控制节奏</h4>
                    <p>
                      掌握吵架的节奏是制胜的关键。不要被对方带着走，而是：
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>使用简洁有力的短句</li>
                      <li>适时停顿，制造紧张感</li>
                      <li>在关键点重复强调</li>
                      <li>控制说话速度，重点处放慢</li>
                    </ul>
                  </div>
                  
                  <Separator className="my-3 bg-border/50" />
                  
                  <div>
                    <h4 className="font-bold mb-1">巧用反问</h4>
                    <p>
                      反问可以瞬间将防守转为进攻：
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>"你有什么依据支持这个观点？"</li>
                      <li>"你确定你理解了我的意思吗？"</li>
                      <li>"如果情况相反，你会怎么想？"</li>
                    </ul>
                  </div>
                  
                  <Separator className="my-3 bg-border/50" />
                  
                  <div>
                    <h4 className="font-bold mb-1">妙用类比</h4>
                    <p>
                      好的类比可以让复杂问题变得直观：
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>将抽象概念具体化</li>
                      <li>使用对方熟悉的领域进行类比</li>
                      <li>用荒谬的类比揭示对方逻辑的漏洞</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <AccordionItem value="structure" className="tech-card border-none">
                <AccordionTrigger className="text-lg font-bold">
                  <div className="flex items-center">
                    <List className="h-5 w-5 mr-2 text-accent_green" />
                    语言结构与表达方式
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-foreground/90 space-y-3 pt-2">
                  <div>
                    <h4 className="font-bold mb-1">三段式结构</h4>
                    <p>
                      高效的论点通常遵循三段式结构：
                    </p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>直接指出对方的问题</li>
                      <li>解释为什么这是个问题</li>
                      <li>提出更合理的观点或解决方案</li>
                    </ol>
                  </div>
                  
                  <Separator className="my-3 bg-border/50" />
                  
                  <div>
                    <h4 className="font-bold mb-1">对比手法</h4>
                    <p>
                      通过对比突显对方观点的不足：
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>"你说的是A，但实际情况是B"</li>
                      <li>"表面上看是X，深入分析后却是Y"</li>
                      <li>"短期来看是利好，长期却是灾难"</li>
                    </ul>
                  </div>
                  
                  <Separator className="my-3 bg-border/50" />
                  
                  <div>
                    <h4 className="font-bold mb-1">层层递进</h4>
                    <p>
                      从小问题逐步扩大到本质问题：
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>指出细节错误</li>
                      <li>揭示思维模式问题</li>
                      <li>质疑基本立场和价值观</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <AccordionItem value="elegance" className="tech-card border-none">
                <AccordionTrigger className="text-lg font-bold">
                  <div className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-accent_orange" />
                    如何优雅制胜
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-foreground/90 space-y-3 pt-2">
                  <div>
                    <h4 className="font-bold mb-1">保持冷静</h4>
                    <p>
                      情绪失控是吵架的大忌：
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>对方越激动，你越冷静</li>
                      <li>用事实和逻辑回应情绪化的攻击</li>
                      <li>适当停顿，展现从容</li>
                    </ul>
                  </div>
                  
                  <Separator className="my-3 bg-border/50" />
                  
                  <div>
                    <h4 className="font-bold mb-1">有选择的让步</h4>
                    <p>
                      在次要问题上让步，可以增强主要观点的可信度：
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>"你说的X有一定道理，但更重要的是Y"</li>
                      <li>"我同意你的部分观点，但核心问题在于..."</li>
                    </ul>
                  </div>
                  
                  <Separator className="my-3 bg-border/50" />
                  
                  <div>
                    <h4 className="font-bold mb-1">巧妙收尾</h4>
                    <p>
                      结束语往往是对方最后的记忆点：
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>简洁总结自己的观点</li>
                      <li>留下值得思考的问题</li>
                      <li>使用修辞手法（如排比、反问）增强震撼力</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          </Accordion>
        </div>
      </div>
    </section>
  );
}