// Career Quest - Game Data

const CAREERS = [
  {
    id: 'chef',
    name: 'Chef',
    nameTh: 'เชฟ',
    icon: '👨‍🍳',
    salary: 8000,
    bonus: 'โบนัสอาหาร +1,000 เมื่อทักษะ Communication',
    special: 'food_bonus',
    color: '#ff7043'
  },
  {
    id: 'programmer',
    name: 'Programmer',
    nameTh: 'โปรแกรมเมอร์',
    icon: '💻',
    salary: 12000,
    bonus: 'โบนัส Coding +2,000',
    special: 'coding_bonus',
    color: '#42a5f5'
  },
  {
    id: 'teacher',
    name: 'Teacher',
    nameTh: 'ครู',
    icon: '👩‍🏫',
    salary: 7000,
    bonus: 'คุณภาพชีวิต +1 ทุก 3 รอบ',
    special: 'life_bonus',
    color: '#66bb6a'
  },
  {
    id: 'farmer',
    name: 'Farmer',
    nameTh: 'เกษตรกร',
    icon: '🌾',
    salary: 6000,
    bonus: 'รายได้มั่นคง ไม่โดนเศรษฐกิจตกต่ำ',
    special: 'stable',
    color: '#8d6e63'
  },
  {
    id: 'electrician',
    name: 'Electrician',
    nameTh: 'ช่างไฟฟ้า',
    icon: '⚡',
    salary: 9000,
    bonus: 'ซ่อมได้ฟรีเมื่ออุปกรณ์เสีย',
    special: 'repair_free',
    color: '#ffca28'
  },
  {
    id: 'designer',
    name: 'Graphic Designer',
    nameTh: 'นักออกแบบ',
    icon: '🎨',
    salary: 8500,
    bonus: 'โบนัส Creativity +1,500',
    special: 'creative_bonus',
    color: '#ab47bc'
  },
  {
    id: 'nurse',
    name: 'Nurse',
    nameTh: 'พยาบาล',
    icon: '👩‍⚕️',
    salary: 9500,
    bonus: 'สุขภาพดี ค่ารักษาลดครึ่ง',
    special: 'health_discount',
    color: '#ef5350'
  },
  {
    id: 'photographer',
    name: 'Photographer',
    nameTh: 'ช่างภาพ',
    icon: '📷',
    salary: 7500,
    bonus: 'โอกาสพิเศษ +20%',
    special: 'opp_bonus',
    color: '#26c6da'
  }
];

const SKILLS = [
  { id: 'english', name: 'English', icon: '🔤', effect: 'รายได้ +500' },
  { id: 'ai', name: 'AI', icon: '🤖', effect: 'รายได้ +1,000' },
  { id: 'marketing', name: 'Marketing', icon: '📣', effect: 'ลูกค้าเพิ่มโอกาส' },
  { id: 'accounting', name: 'Accounting', icon: '🧮', effect: 'ลดค่าใช้จ่าย 10%' },
  { id: 'coding', name: 'Coding', icon: '⌨️', effect: 'โบนัสโปรแกรมเมอร์' },
  { id: 'communication', name: 'Communication', icon: '💬', effect: 'เลื่อนตำแหน่งง่ายขึ้น' },
  { id: 'leadership', name: 'Leadership', icon: '👑', effect: 'รายได้ +800' },
  { id: 'creativity', name: 'Creativity', icon: '✨', effect: 'โบนัสนักออกแบบ' }
];

const EVENTS = [
  { id: 'laptop_broke', name: 'Laptop เสีย!', icon: '💻', type: 'bad', effect: { money: -3000 }, desc: 'คอมพิวเตอร์พัง ต้องซ่อม' },
  { id: 'bonus', name: 'โบนัสพิเศษ!', icon: '🎁', type: 'good', effect: { money: 2000 }, desc: 'ได้รับโบนัสจากที่ทำงาน' },
  { id: 'economy_down', name: 'เศรษฐกิจตกต่ำ', icon: '📉', type: 'bad', effect: { money: -1500 }, desc: 'รายได้ลดลงชั่วคราว' },
  { id: 'scholarship', name: 'ได้ทุนเรียน!', icon: '🎓', type: 'good', effect: { money: 3000, skill: true }, desc: 'ได้รับทุนการศึกษา' },
  { id: 'electric_bill', name: 'ค่าไฟขึ้น', icon: '💡', type: 'bad', effect: { money: -800 }, desc: 'ค่าสาธารณูปโภคเพิ่มขึ้น' },
  { id: 'medical', name: 'ค่ารักษาพยาบาล', icon: '🏥', type: 'bad', effect: { money: -2500 }, desc: 'ต้องไปพบแพทย์' },
  { id: 'more_clients', name: 'ลูกค้าเพิ่ม!', icon: '👥', type: 'good', effect: { money: 2500 }, desc: 'มีลูกค้าใหม่เข้ามา' },
  { id: 'ai_help', name: 'AI ช่วยงาน', icon: '🤖', type: 'good', effect: { money: 1500 }, desc: 'AI ช่วยเพิ่มประสิทธิภาพ' },
  { id: 'tax', name: 'ต้องจ่ายภาษี', icon: '🧾', type: 'bad', effect: { money: -1200 }, desc: 'ถึงเวลาจ่ายภาษี' },
  { id: 'promotion_chance', name: 'โอกาสเลื่อนตำแหน่ง', icon: '📈', type: 'good', effect: { level: 1 }, desc: 'มีโอกาสได้เลื่อนตำแหน่ง' },
  { id: 'friend_loan', name: 'เพื่อนขอยืมเงิน', icon: '🤝', type: 'choice', effect: { money: -1000 }, desc: 'เพื่อนต้องการยืม 1,000 บาท' },
  { id: 'side_hustle', name: 'งานพิเศษ', icon: '💼', type: 'good', effect: { money: 1800 }, desc: 'ได้งานพิเศษนอกเวลา' }
];

const LIFE_EVENTS = [
  { id: 'rest', name: 'พักผ่อน', icon: '😴', effect: { life: 2 }, desc: 'ได้พักผ่อนเต็มที่ คุณภาพชีวิตดีขึ้น' },
  { id: 'stress', name: 'เครียด', icon: '😰', effect: { life: -2 }, desc: 'งานหนักเกินไป เครียดสะสม' },
  { id: 'healthy', name: 'สุขภาพดี', icon: '💪', effect: { life: 1 }, desc: 'ออกกำลังกายสม่ำเสมอ' },
  { id: 'family', name: 'เวลาครอบครัว', icon: '👨‍👩‍👧', effect: { life: 2 }, desc: 'ใช้เวลากับครอบครัว' },
  { id: 'hobby', name: 'งานอดิเรก', icon: '🎸', effect: { life: 1 }, desc: 'ได้ทำสิ่งที่ชอบ' },
  { id: 'burnout', name: 'หมดไฟ', icon: '🔥', effect: { life: -3 }, desc: 'ทำงานหนักเกินไป' }
];

const INVESTMENTS = [
  { id: 'equipment', name: 'ซื้ออุปกรณ์', icon: '🛠️', cost: 3000, risk: 'low', return: { type: 'salary', value: 500 }, desc: 'เพิ่มประสิทธิภาพงาน รายได้ +500/รอบ' },
  { id: 'course', name: 'เรียนคอร์ส', icon: '📚', cost: 2000, risk: 'none', return: { type: 'skill', value: 1 }, desc: 'ได้ทักษะใหม่ 1 อย่าง' },
  { id: 'business', name: 'ลงทุนธุรกิจ', icon: '🏪', cost: 5000, risk: 'high', return: { type: 'money', value: [ -2000, 8000 ] }, desc: 'เสี่ยงสูง อาจได้ 8,000 หรือเสีย 2,000' },
  { id: 'stock', name: 'ลงทุนหุ้น', icon: '📊', cost: 2500, risk: 'medium', return: { type: 'money', value: [ -1000, 5000 ] }, desc: 'เสี่ยงปานกลาง' },
  { id: 'savings_boost', name: 'ฝากประจำ', icon: '🏦', cost: 2000, risk: 'none', return: { type: 'saving', value: 500 }, desc: 'ได้ดอกเบี้ย เงินออม +500' }
];

const SAVING_OPTIONS = [0, 1000, 2000, 3000, 5000];

// Board layout: 40 cells
// Types cycle in interesting pattern
const BOARD_LAYOUT = [
  { type: 'start', icon: '🏁', label: 'START' },
  { type: 'salary', icon: '💰', label: 'เงินเดือน' },
  { type: 'skill', icon: '⭐', label: 'ทักษะ' },
  { type: 'event', icon: '🎲', label: 'เหตุการณ์' },
  { type: 'saving', icon: '🏦', label: 'ออม' },
  { type: 'salary', icon: '💰', label: 'เงินเดือน' },
  { type: 'investment', icon: '📈', label: 'ลงทุน' },
  { type: 'life', icon: '❤️', label: 'ชีวิต' },
  { type: 'opportunity', icon: '🚪', label: 'โอกาส' },
  { type: 'event', icon: '🎲', label: 'เหตุการณ์' },
  { type: 'salary', icon: '💰', label: 'เงินเดือน' },
  { type: 'skill', icon: '⭐', label: 'ทักษะ' },
  { type: 'bonus', icon: '🎁', label: 'โบนัส' },
  { type: 'saving', icon: '🏦', label: 'ออม' },
  { type: 'event', icon: '🎲', label: 'เหตุการณ์' },
  { type: 'investment', icon: '📈', label: 'ลงทุน' },
  { type: 'salary', icon: '💰', label: 'เงินเดือน' },
  { type: 'life', icon: '❤️', label: 'ชีวิต' },
  { type: 'skill', icon: '⭐', label: 'ทักษะ' },
  { type: 'opportunity', icon: '🚪', label: 'โอกาส' },
  { type: 'event', icon: '🎲', label: 'เหตุการณ์' },
  { type: 'salary', icon: '💰', label: 'เงินเดือน' },
  { type: 'saving', icon: '🏦', label: 'ออม' },
  { type: 'investment', icon: '📈', label: 'ลงทุน' },
  { type: 'bonus', icon: '🎁', label: 'โบนัส' },
  { type: 'life', icon: '❤️', label: 'ชีวิต' },
  { type: 'skill', icon: '⭐', label: 'ทักษะ' },
  { type: 'event', icon: '🎲', label: 'เหตุการณ์' },
  { type: 'salary', icon: '💰', label: 'เงินเดือน' },
  { type: 'opportunity', icon: '🚪', label: 'โอกาส' },
  { type: 'saving', icon: '🏦', label: 'ออม' },
  { type: 'investment', icon: '📈', label: 'ลงทุน' },
  { type: 'life', icon: '❤️', label: 'ชีวิต' },
  { type: 'event', icon: '🎲', label: 'เหตุการณ์' },
  { type: 'skill', icon: '⭐', label: 'ทักษะ' },
  { type: 'salary', icon: '💰', label: 'เงินเดือน' },
  { type: 'bonus', icon: '🎁', label: 'โบนัส' },
  { type: 'opportunity', icon: '🚪', label: 'โอกาส' },
  { type: 'saving', icon: '🏦', label: 'ออม' },
  { type: 'event', icon: '🎲', label: 'เหตุการณ์' }
];

const PLAYER_COLORS = ['#ef5350', '#42a5f5', '#66bb6a', '#ffca28', '#ab47bc'];
const PLAYER_AVATARS = ['👦', '👧', '👨', '👩', '🧑'];
