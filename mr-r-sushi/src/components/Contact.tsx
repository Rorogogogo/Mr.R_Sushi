import { useState } from 'react'
import { motion } from 'framer-motion'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: '',
    date: '',
    time: '',
    message: '',
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would handle form submission here
    console.log('Form submitted:', formData)
    alert('感谢您的预订请求！我们将尽快与您联系确认。')
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      guests: '',
      date: '',
      time: '',
      message: '',
    })
  }

  const contactInfo = [
    {
      icon: '📍',
      title: '位置',
      details: ['经三路小学向西10米'],
    },
    {
      icon: '📞',
      title: '电话',
      details: ['13203745087'],
    },
    {
      icon: '✉️',
      title: '邮箱',
      details: ['info@mrsushi.com'],
    },
    {
      icon: '🕐',
      title: '营业时间',
      details: [
        '周一至周五: 上午11:00 - 晚上10:00',
        '周六至周日: 中午12:00 - 晚上11:00'
      ],
    },
  ]

  const socialLinks = [
    { name: 'WeChat', icon: '💬', href: '/qrcode/Wechat_account.jpg' },
    { name: 'WeChat Pay', icon: '💳', href: '/qrcode/Wechat_pay.jpg' },
  ]

  return (
    <section id="contact" className="py-24 bg-modern-light relative overflow-hidden">
      {/* Optimized Background Pattern */}
      <div className="absolute inset-0 opacity-[0.01] pointer-events-none">
        <div 
          className="absolute inset-0 gpu-accelerated"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="section-heading text-modern-dark">联系我们</h2>
          <p className="text-lg text-modern-gray max-w-2xl mx-auto font-light leading-relaxed">
            预约座位或与我们联系。我们期待为您服务！
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="modern-card">
              <h3 className="text-2xl font-display font-normal text-modern-dark mb-8">
                餐厅信息
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-4"
                  >
                    <div className="text-3xl">{item.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-modern-dark mb-2">
                        {item.title}
                      </h4>
                      {item.details.map((detail, idx) => (
                        <p key={idx} className="text-modern-gray leading-relaxed">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* QR Codes & Social */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Social Links */}
            <div className="modern-card">
              <h4 className="text-xl font-semibold text-modern-dark mb-6">
                联系方式
              </h4>
              <div className="space-y-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3 p-4 bg-modern-cream rounded-2xl hover:bg-modern-beige transition-all duration-300 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {social.icon}
                    </span>
                    <span className="font-medium text-modern-dark">
                      {social.name}
                    </span>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* QR Code Display */}
            <div className="modern-card">
              <h4 className="text-xl font-semibold text-modern-dark mb-6">
                微信二维码
              </h4>
              <div className="space-y-4">
                <div className="bg-modern-cream rounded-2xl p-4">
                  <img
                    src="/qrcode/Wechat_account.jpg"
                    alt="微信账号"
                    className="w-full max-w-32 mx-auto rounded-xl"
                  />
                  <p className="text-center text-sm text-modern-gray mt-2">
                    微信账号
                  </p>
                </div>
                <div className="bg-modern-cream rounded-2xl p-4">
                  <img
                    src="/qrcode/Wechat_pay.jpg"
                    alt="微信支付"
                    className="w-full max-w-32 mx-auto rounded-xl"
                  />
                  <p className="text-center text-sm text-modern-gray mt-2">
                    微信支付
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="glass-card inline-block p-8">
            <h3 className="text-2xl font-display font-normal text-modern-dark mb-4">
              准备好体验正宗日式料理了吗？
            </h3>
            <p className="text-modern-gray mb-6">
              立即预约座位，享受新鲜美味的寿司盛宴
            </p>
            <a
              href="tel:13203745087"
              className="btn-primary inline-flex items-center"
            >
              <span className="text-2xl mr-2">📞</span>
              立即预约
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Contact
