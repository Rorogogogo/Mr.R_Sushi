import { motion } from 'framer-motion'

const About = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}>
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-sushi-red rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-sushi-gold rounded-full opacity-20"></div>
              <div className="bg-gray-200 rounded-lg h-80 md:h-96 overflow-hidden relative z-10">
                {/* This would be an actual image in production */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-display text-2xl">
                  餐厅图片
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}>
            <h2 className="text-4xl font-display font-bold text-sushi-black mb-6">
              关于 <span className="text-sushi-red">Mr. R 寿司</span>
            </h2>

            <p className="text-gray-600 mb-4">
              欢迎来到Mr.
              R寿司，这是一家家族经营的餐厅，为您的社区带来正宗的日本料理。我们的故事始于对分享传统寿司的热情，这些寿司采用最新鲜的食材精心制作，并以一丝不苟的细节准备。
            </p>

            <p className="text-gray-600 mb-6">
              Mr.
              R寿司的每一道菜都是精心制作的，结合传统技术和创新风味，为您提供难忘的用餐体验。我们为我们的菜单感到自豪，其中既有经典的最爱，也有创意的特色菜。
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sushi-red text-xl font-bold mb-2">
                  新鲜
                </div>
                <p className="text-sm text-gray-600">
                  我们只使用每日采购的最新鲜食材。
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sushi-red text-xl font-bold mb-2">
                  正宗
                </div>
                <p className="text-sm text-gray-600">
                  传统食谱配以正宗的日本风味。
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sushi-red text-xl font-bold mb-2">
                  家族
                </div>
                <p className="text-sm text-gray-600">
                  一家家族经营的餐厅，氛围温馨。
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sushi-red text-xl font-bold mb-2">
                  品质
                </div>
                <p className="text-sm text-gray-600">
                  致力于在我们提供的每一道菜中追求卓越。
                </p>
              </div>
            </div>

            <button className="btn-primary">了解我们的故事</button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About
