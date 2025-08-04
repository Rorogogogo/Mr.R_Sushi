import { motion } from 'framer-motion'

const About = () => {
  const features = [
    {
      title: '新鲜',
      description: '我们只使用每日采购的最新鲜食材',
      icon: '🐟'
    },
    {
      title: '正宗',
      description: '传统食谱配以正宗的日本风味',
      icon: '🇯🇵'
    },
    {
      title: '家族',
      description: '一家家族经营的餐厅，氛围温馨',
      icon: '👨‍👩‍👧‍👦'
    },
    {
      title: '品质',
      description: '致力于在我们提供的每一道菜中追求卓越',
      icon: '⭐'
    }
  ]

  return (
    <section id="about" className="py-24 bg-modern-dark relative overflow-hidden">
      {/* Optimized Background Pattern */}
      <div className="absolute inset-0 opacity-[0.01] pointer-events-none">
        <div 
          className="absolute inset-0 gpu-accelerated"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Visual Side */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Simplified Decorative Elements */}
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-accent-gold/5 rounded-full gpu-accelerated" />
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-accent-warm/5 rounded-full gpu-accelerated" />
            
            {/* Main Image Container */}
            <div className="relative">
              <div className="glass-card p-8">
                <img
                  src="/images/Logo.png"
                  alt="Mr.R Sushi Restaurant"
                  className="w-full max-h-80 object-contain filter brightness-110"
                />
              </div>
              
              {/* Static Badge for Performance */}
              <div className="absolute -top-4 -right-4 glass-card px-6 py-3 gpu-accelerated">
                <div className="text-accent-gold font-bold text-sm">
                  since 2020
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-normal text-modern-light leading-tight">
                关于 <span className="text-accent-gold">Mr. R</span> 寿司
              </h2>

              <div className="space-y-4 text-modern-light/80 text-lg font-light leading-relaxed">
                <p>
                  欢迎来到 Mr. R 寿司，这是一家家族经营的餐厅，为您的社区带来正宗的日本料理。我们的故事始于对分享传统寿司的热情，这些寿司采用最新鲜的食材精心制作。
                </p>

                <p>
                  每一道菜都是精心制作的艺术品，结合传统技术和创新风味，为您提供难忘的用餐体验。我们为我们的菜单感到自豪，其中既有经典的最爱，也有创意的特色菜。
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card p-4 group hover:bg-modern-light/10 transition-all duration-300"
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className="text-accent-gold text-lg font-semibold mb-1">
                    {feature.title}
                  </div>
                  <p className="text-modern-light/70 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <button className="btn-outline text-modern-light border-modern-light hover:bg-modern-light hover:text-modern-dark">
                了解我们的故事
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About
