'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const TESTIMONIALS = [
  {
    name: '张先生',
    role: '公司中层',
    quote: '不得不说，这个工具真的很有用。上次开会遇到同事质疑我的方案，我用"老板式发言"风格回怼了一句，会议室里安静了3秒，然后老板第一个鼓掌。',
    initials: 'ZX',
    avatarColor: 'bg-primary/30',
  },
  {
    name: '李女士',
    role: '家庭主妇',
    quote: '之前和婆婆斗嘴总是被怼得无言以对，用了这个工具后，我的文艺风回复让婆婆直接愣住，现在她提前一天通知才敢来我家。',
    initials: 'LN',
    avatarColor: 'bg-accent_orange/30',
  },
  {
    name: '王律师',
    role: '执业律师',
    quote: '作为律师，我本来以为自己已经很会说话了。但这个工具的"律师风"回复确实给了我一些启发，让我的辩论更加有力度。专业人士也能从中受益。',
    initials: 'WL',
    avatarColor: 'bg-accent_green/30',
  },
  {
    name: '刘经理',
    role: '客服主管',
    quote: '我们团队处理投诉时经常需要既表达诚意又不能让步。"冷嘲热讽风"配上10级强度，简直就是对付无理取闹客户的神器。',
    initials: 'LJ',
    avatarColor: 'bg-primary/30',
  },
  {
    name: '小陈',
    role: '网络博主',
    quote: '现在回复键盘侠变得如此轻松！点一下就能生成既有气势又不失水平的回复，还有表情包加持，评论区已经没人敢惹我了。',
    initials: 'XC',
    avatarColor: 'bg-accent_orange/30',
  },
  {
    name: '赵业务',
    role: '销售经理',
    quote: '遇到客户狂砍价怎么办？"哲学家风"的回复让他们瞬间感到自己很肤浅。成单率提高了15%，老板都想知道我最近怎么这么会说话。',
    initials: 'ZY',
    avatarColor: 'bg-accent_green/30',
  },
];

export function Testimonials() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4">
        <div className="mb-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-chakra mb-2">
            用户心声
          </h2>
          <p className="text-muted-foreground">
            各行各业的用户都在使用吵架包赢MAX
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="tech-card relative"
            >
              <Quote className="absolute top-4 right-4 h-6 w-6 text-primary/30" />
              
              <div className="flex items-center mb-4">
                <Avatar className={`h-12 w-12 mr-4 ${testimonial.avatarColor}`}>
                  <AvatarFallback className="text-foreground">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="font-bold">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              
              <p className="text-sm text-foreground/90 italic">
                "{testimonial.quote}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}