
import { InvitationTemplate, InvitationElement } from '../types';

export const PRESET_FONTS = [
  // Sans-serif
  { name: 'Inter', family: 'Inter', type: 'sans-serif' },
  { name: 'Montserrat', family: 'Montserrat', type: 'sans-serif' },
  { name: 'Oswald', family: 'Oswald', type: 'sans-serif' },
  { name: 'Quicksand', family: 'Quicksand', type: 'sans-serif' },
  
  // Serif (Luxury/Elegant)
  { name: 'Cinzel', family: 'Cinzel', type: 'serif' },
  { name: 'Cinzel Decorative', family: 'Cinzel Decorative', type: 'serif' },
  { name: 'Playfair Display', family: 'Playfair Display', type: 'serif' },
  { name: 'Playfair Display SC', family: 'Playfair Display SC', type: 'serif' },
  { name: 'Cormorant Garamond', family: 'Cormorant Garamond', type: 'serif' },
  { name: 'Cormorant Infant', family: 'Cormorant Infant', type: 'serif' },
  { name: 'Cormorant Upright', family: 'Cormorant Upright', type: 'serif' },
  { name: 'Bodoni Moda', family: 'Bodoni Moda', type: 'serif' },
  { name: 'Castoro Titling', family: 'Castoro Titling', type: 'serif' },
  { name: 'Italiana', family: 'Italiana', type: 'serif' },
  { name: 'Prata', family: 'Prata', type: 'serif' },
  { name: 'Marcellus', family: 'Marcellus', type: 'serif' },
  { name: 'Aboreto', family: 'Aboreto', type: 'serif' },
  
  // Script / Calligraphy (Aesthetic)
  { name: 'Pinyon Script', family: 'Pinyon Script', type: 'script' },
  { name: 'Great Vibes', family: 'Great Vibes', type: 'script' },
  { name: 'Alex Brush', family: 'Alex Brush', type: 'script' },
  { name: 'Parisienne', family: 'Parisienne', type: 'script' },
  { name: 'Allura', family: 'Allura', type: 'script' },
  { name: 'Sacramento', family: 'Sacramento', type: 'script' },
  { name: 'Dancing Script', family: 'Dancing Script', type: 'script' },
  { name: 'WindSong', family: 'WindSong', type: 'script' },
  { name: 'Imperial Script', family: 'Imperial Script', type: 'script' },
  { name: 'Monsieur La Doulaise', family: 'Monsieur La Doulaise', type: 'script' },
  { name: 'Mea Culpa', family: 'Mea Culpa', type: 'script' },
  { name: 'Petit Formal Script', family: 'Petit Formal Script', type: 'script' },
  { name: 'Herr Von Muellerhoff', family: 'Herr Von Muellerhoff', type: 'script' },
];

export const PRESET_BACKGROUNDS = [
  { name: 'Warm Alabaster', type: 'color', color: '#FDFBF7' },
  { name: 'Soft Cream', type: 'color', color: '#F9F6F0' },
  { name: 'Bridal White', type: 'color', color: '#FFFFFF' },
  { name: 'Champagne Silk', type: 'color', color: '#FFF9E6' },
  { name: 'Sage Green', type: 'color', color: '#E3ECE4' },
  { name: 'Dusty Rose', type: 'color', color: '#F0E2E1' },
  { name: 'Luxury Indigo', type: 'color', color: '#0F172A' },
  { name: 'Royal Emerald', type: 'color', color: '#0A251C' },
  
  // Gradients
  { name: 'Gold Dust Gradient', type: 'gradient', gradientStart: '#FFF9E6', gradientEnd: '#E6D2B1', gradientAngle: 135 },
  { name: 'Midnight Silk Gradient', type: 'gradient', gradientStart: '#0F172A', gradientEnd: '#1E293B', gradientAngle: 135 },
  { name: 'Teal Forest Gradient', type: 'gradient', gradientStart: '#064E3B', gradientEnd: '#115E59', gradientAngle: 90 },
  { name: 'Velvet Rose Gradient', type: 'gradient', gradientStart: '#4C1D95', gradientEnd: '#831843', gradientAngle: 45 },
];

export const PRESET_SHAPES = [
  { name: 'Rectangle', type: 'rect' },
  { name: 'Circle', type: 'circle' },
  { name: 'Star Shape', type: 'star', path: 'M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z' },
  { name: 'Heart Shape', type: 'heart', path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
  { name: 'Diamond', type: 'diamond', path: 'M12 2L2 12l10 10 10-10L12 2z' },
  { name: 'Pentagon', type: 'pentagon', path: 'M 12 2 L 22 9.5 L 18 21 L 6 21 L 2 9.5 Z' },
  { name: 'Hexagon', type: 'hexagon', path: 'M12 2L2 7.75v11.5L12 25l10-5.75v-11.5L12 2z' },
  { name: 'Octagon', type: 'octagon', path: 'M 7 2 L 17 2 L 22 7 L 22 17 L 17 22 L 7 22 L 2 17 L 2 7 Z' },
  { name: 'Triangle', type: 'triangle', path: 'M12 2L2 22h20L12 2z' },
  { name: 'Cross', type: 'cross', path: 'M 9 2 L 15 2 L 15 9 L 22 9 L 22 15 L 15 15 L 15 22 L 9 22 L 9 15 L 2 15 L 2 9 L 9 9 Z' },
  { name: 'Droplet', type: 'droplet', path: 'M12 2C12 2 4 10.4 4 15.6C4 20.2 7.6 23.8 12 23.8C16.4 23.8 20 20.2 20 15.6C20 10.4 12 2 12 2Z' },
  { name: 'Arch', type: 'arch', path: 'M 4 22 L 20 22 L 20 12 A 8 8 0 0 0 4 12 Z' },
  { name: 'Leaf', type: 'leaf', path: 'M 3 21 C 3 21 3 10 12 2 C 21 2 21 13 12 21 C 9 21 3 21 3 21 Z' },
  { name: 'Arrow Right', type: 'arrow', path: 'M 2 10 L 16 10 L 16 5 L 23 12 L 16 19 L 16 14 L 2 14 Z' },
  { name: 'Wave Banner', type: 'wave', path: 'M0 6c4 0 4 4 8 4s4-4 8-4 4 4 8 4v10c-4 0-4-4-8-4s-4 4-8 4-4-4-8-4V6z' },
  { name: 'Classic Frame', type: 'frame' },
  { name: 'Luxury Corner', type: 'corner', path: 'M2 2h10v2H4v8H2V2zm20 0H12v2h8v8h2V2zM2 22h10v-2H4v-8H2v10zm20 0H12v-2h8v-8h2v10z' },
];


export const PRESET_DIVIDERS = [
  { name: 'Simple Line', type: 'line', style: 'solid' },
  { name: 'Dashed Line', type: 'line', style: 'dashed' },
  { name: 'Ornate Leaves', type: 'svg', path: 'M10 20c0-5.5 4.5-10 10-10S30 14.5 30 20s-4.5 10-10 10-10-4.5-10-10z' },
  { name: 'Flourish Accent', type: 'svg', path: 'M20,10 C15,10 12,14 10,18 C8,14 5,10 0,10 M10,18 L10,22' },
];

export const SAMPLE_IMAGES = [
  { name: 'Modern Wedding Couple', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800' },
  { name: 'Classic Wedding Rings', url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800' },
  { name: 'Elegant Bridal Flowers', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800' },
  { name: 'Scenic Outdoor Wedding', url: 'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=800' },
  { name: 'Toast Champagne Glasses', url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800' },
];

// Helper to generate elements easily with unique IDs
const makeId = () => Math.random().toString(36).substring(2, 9);

export const DEFAULT_TEMPLATES: Record<string, InvitationTemplate> = {};



export const ELEMENT_TEMPLATES = {
  text: {
    name: 'New Text',
    type: 'text' as const,
    text: 'Tap to Edit Text',
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400',
    fontStyle: 'normal' as const,
    textColor: '#1E293B',
    textAlign: 'center' as const,
    width: 200,
    height: 35,
    rotation: 0,
    opacity: 1,
  },
  image: {
    name: 'Wedding Image',
    type: 'image' as const,
    src: SAMPLE_IMAGES[0].url,
    width: 250,
    height: 180,
    rotation: 0,
    opacity: 1,
    borderRadius: 8,
  },
  shape: {
    name: 'Gold Rectangle',
    type: 'shape' as const,
    width: 150,
    height: 150,
    rotation: 0,
    opacity: 0.5,
    backgroundColor: '#E6D2B1',
    borderRadius: 8,
  },
  divider: {
    name: 'Minimalist Divider',
    type: 'divider' as const,
    width: 150,
    height: 2,
    rotation: 0,
    opacity: 0.8,
    backgroundColor: '#D4AF37',
  },
  button: {
    name: 'Interactive RSVP Button',
    type: 'button' as const,
    text: 'CONFIRM RSVP NOW',
    fontFamily: 'Montserrat',
    fontSize: 12,
    fontWeight: '600',
    textColor: '#FFFFFF',
    backgroundColor: '#0F172A',
    borderRadius: 999,
    width: 180,
    height: 40,
    rotation: 0,
    opacity: 1,
    shadowColor: '#000000',
    shadowBlur: 5,
    shadowOffsetX: 0,
    shadowOffsetY: 2,
  },
};

export const COMPONENT_TEMPLATES = {
  hero: {
    name: 'Hero Cover Section',
    elements: [
      {
        name: 'Cover Title',
        type: 'text' as const,
        text: 'YOU ARE INVIPITED',
        fontFamily: 'Montserrat',
        fontSize: 10,
        fontWeight: '500',
        textColor: '#8C7A5B',
        textAlign: 'center' as const,
        letterSpacing: 4,
        width: 300,
        height: 25,
      },
      {
        name: 'Bride & Groom Initials',
        type: 'text' as const,
        text: 'S & W',
        fontFamily: 'Cinzel',
        fontSize: 48,
        fontWeight: '600',
        textColor: '#D4AF37',
        textAlign: 'center' as const,
        width: 300,
        height: 65,
      },
    ],
  },
  brideGroom: {
    name: 'Bride & Groom Profile',
    elements: [
      {
        name: 'Bride Portrait',
        type: 'image' as const,
        src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderColor: '#D4AF37',
        borderWidth: 2,
      },
      {
        name: 'Groom Portrait',
        type: 'image' as const,
        src: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderColor: '#D4AF37',
        borderWidth: 2,
      },
    ],
  },
  countdown: {
    name: 'Love Countdown',
    type: 'widget' as const,
    widgetType: 'countdown' as const,
    width: 300,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderColor: '#E6D2B1',
    borderWidth: 1,
    widgetConfig: {
      title: 'LOVE COUNTDOWN',
      targetDate: '2026-10-24T16:00:00',
    },
  },
  rsvp: {
    name: 'RSVP Form',
    type: 'widget' as const,
    widgetType: 'rsvp' as const,
    width: 300,
    height: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderColor: '#D4AF37',
    borderWidth: 1,
    widgetConfig: {
      title: 'ATTENDANCE CONFIRMATION',
      rsvpSubmissionCount: 5,
      rsvpFields: ['name', 'attendance', 'guests', 'wishes'],
    },
  },
  gift: {
    name: 'Wedding Digital Gift',
    type: 'widget' as const,
    widgetType: 'gift' as const,
    width: 300,
    height: 150,
    backgroundColor: '#F9F6F0',
    borderRadius: 16,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    widgetConfig: {
      giftBankName: 'Bank Central Asia (BCA)',
      giftAccountNumber: '7112-990-128',
      giftRecipientName: 'Sophia & William',
      giftCardStyle: 'bca-blue',
    },
  },
  location: {
    name: 'Google Maps Location',
    type: 'widget' as const,
    widgetType: 'maps' as const,
    width: 300,
    height: 85,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    widgetConfig: {
      mapUrl: 'https://maps.google.com/?q=The+Ritz-Carlton',
      eventLocationName: 'The Ritz-Carlton Ballroom, Jakarta',
    },
  },
};

export const COMPONENT_STYLE_PRESETS = {countdown:{classic:{name:"Classic Gold Countdown",backgroundColor:"#FFFFFF",borderColor:"#D4AF37",borderWidth:1,borderRadius:12,widgetConfig:{title:"LOVE COUNTDOWN",targetDate:"2026-10-24T16:00:00"}},rustic:{name:"Rustic Earthy Countdown",backgroundColor:"#FFF9E6",borderColor:"#8C7A5B",borderWidth:1.5,borderRadius:8,widgetConfig:{title:"HITUNG MUNDUR ACARA INDAH",targetDate:"2026-11-21T09:00:00"}},emerald:{name:"Modern Emerald Countdown",backgroundColor:"#F4FAF7",borderColor:"#0F5132",borderWidth:1,borderRadius:16,widgetConfig:{title:"THE ADVENTURE BEGINS IN",targetDate:"2026-12-18T16:00:00"}},royal:{name:"Royal Blue & Gold Countdown",backgroundColor:"#0B132B",borderColor:"#D4AF37",borderWidth:2,borderRadius:12,widgetConfig:{title:"HARI BAHAGIA AKAN SEGERA TIBA",targetDate:"2026-10-24T16:00:00"}}},rsvp:{classic:{name:"Classic Luxury RSVP Form",backgroundColor:"#FFFFFF",borderColor:"#D4AF37",borderWidth:1,borderRadius:12,textColor:"#2D271E",widgetConfig:{title:"ATTENDANCE CONFIRMATION",subtitle:"Please confirm your attendance to help us plan the best experience.",buttonColor:"#1E293B",buttonTextColor:"#FFFFFF",inputBgColor:"#F8FAFC",inputTextColor:"#1E293B",accentColor:"#D4AF37",rsvpSubmissionCount:24,rsvpFields:["name","attendance","guests","wishes"]}},rustic:{name:"Rustic Javanese RSVP Form",backgroundColor:"#FFF9E6",borderColor:"#8C7A5B",borderWidth:1.5,borderRadius:8,textColor:"#5C4033",widgetConfig:{title:"KONFIRMASI KEHADIRAN TAMU",subtitle:"Mohon konfirmasi kehadiran Anda untuk membantu kami mempersiapkan jamuan terbaik.",buttonColor:"#8C7A5B",buttonTextColor:"#FFFFFF",inputBgColor:"#FFFFFF",inputTextColor:"#2C1D11",accentColor:"#8C7A5B",rsvpSubmissionCount:42,rsvpFields:["name","attendance","guests","wishes"]}},emerald:{name:"Modern Botanical RSVP",backgroundColor:"#E8F5E9",borderColor:"#2E7D32",borderWidth:1,borderRadius:16,textColor:"#1B4332",widgetConfig:{title:"WILL YOU JOIN US?",subtitle:"Kindly let us know if you can make it before the deadline.",buttonColor:"#2E7D32",buttonTextColor:"#FFFFFF",inputBgColor:"#FFFFFF",inputTextColor:"#1B4332",accentColor:"#2E7D32",rsvpSubmissionCount:15,rsvpFields:["name","attendance","guests"]}},royal:{name:"Luxury Dark Gold RSVP",backgroundColor:"#111625",borderColor:"#D4AF37",borderWidth:1.5,borderRadius:20,textColor:"#D4AF37",widgetConfig:{title:"Konfirmasi Kehadiran",subtitle:"Mohon konfirmasi kehadiran Anda untuk membantu kami mempersiapkan jamuan terbaik.",buttonColor:"#D4AF37",buttonTextColor:"#111625",inputBgColor:"#1A2035",inputTextColor:"#FFFFFF",accentColor:"#D4AF37",rsvpSubmissionCount:35,rsvpFields:["name","attendance","guests","wishes"]}}},gift:{classic:{name:"Classic Gold Gift Box",backgroundColor:"#FFFFFF",borderColor:"#D4AF37",borderWidth:1,borderRadius:12,widgetConfig:{giftBankName:"Bank Central Asia (BCA)",giftAccountNumber:"7112-990-128",giftRecipientName:"Sophia & William"}},rustic:{name:"Earthy Indonesian Gift Card",backgroundColor:"#FFF9E6",borderColor:"#8C7A5B",borderWidth:1,borderRadius:8,widgetConfig:{giftBankName:"Bank Central Asia (BCA)",giftAccountNumber:"843-0518-293",giftRecipientName:"Sekar Ningrum"}},emerald:{name:"Emerald Minimalist Gift Box",backgroundColor:"#F4FAF7",borderColor:"#0F5132",borderWidth:1.2,borderRadius:16,widgetConfig:{giftBankName:"Bank Mandiri",giftAccountNumber:"131-00-1829304-2",giftRecipientName:"Aditya Pratama"}},royal:{name:"Royal Gold Gift Envelope",backgroundColor:"rgba(255,255,255,0.03)",borderColor:"#D4AF37",borderWidth:1.5,borderRadius:10,widgetConfig:{giftBankName:"Bank BCA",giftAccountNumber:"711-2099-012",giftRecipientName:"William Gozali"}}},location:{classic:{name:"Classic Gold Google Maps",backgroundColor:"#FFFFFF",borderColor:"#D4AF37",borderWidth:1,borderRadius:12,widgetConfig:{mapUrl:"https://maps.google.com/?q=The+Ritz-Carlton",eventLocationName:"The Ritz-Carlton Ballroom, Jakarta"}},rustic:{name:"Rustic Earthy Venue Maps",backgroundColor:"#FFF9E6",borderColor:"#8C7A5B",borderWidth:1,borderRadius:8,widgetConfig:{mapUrl:"https://maps.google.com/?q=Masjid+Agung+Al-Azhar+Kebayoran+Baru",eventLocationName:"Masjid Agung Al-Azhar, Jakarta Selatan"}},emerald:{name:"Emerald Botanical Venue Maps",backgroundColor:"#F4FAF7",borderColor:"#0F5132",borderWidth:1,borderRadius:16,widgetConfig:{mapUrl:"https://maps.google.com/?q=Emerald+Garden+Greenhouse",eventLocationName:"Emerald Garden Greenhouse, Bandung"}},royal:{name:"Royal Gold Venue Map",backgroundColor:"rgba(255,255,255,0.03)",borderColor:"#D4AF37",borderWidth:1.5,borderRadius:12,widgetConfig:{mapUrl:"https://maps.google.com/?q=The+Ritz-Carlton+Mega+Kuningan+Jakarta",eventLocationName:"The Ritz-Carlton Mega Kuningan, Jakarta"}}},event:{classic:{name:"Classic Gold Event Card",backgroundColor:"#FFFFFF",borderColor:"#D4AF37",borderWidth:1,borderRadius:12,widgetConfig:{title:"THE WEDDING RECEPTION",eventTime:"06:00 PM - 10:00 PM",eventLocationName:"Glass Greenhouse, Jakarta"}},rustic:{name:"Earthy Indonesian Event Card",backgroundColor:"#FFF9E6",borderColor:"#8C7A5B",borderWidth:1,borderRadius:8,widgetConfig:{title:"RESEPSI PERNIKAHAN",eventTime:"11:00 WIB - 14:00 WIB",eventLocationName:"Grand Ballroom Al-Azhar, Kebayoran Baru, Jakarta"}},emerald:{name:"Emerald Botanical Event Details",backgroundColor:"#F4FAF7",borderColor:"#0F5132",borderWidth:1,borderRadius:16,widgetConfig:{title:"CELEBRATION DINNER",eventTime:"18:00 WIB - Selesai",eventLocationName:"Greenhouse Orchid Room, Lembang"}},royal:{name:"Royal Ornate Reception Card",backgroundColor:"rgba(255,255,255,0.03)",borderColor:"#D4AF37",borderWidth:2,borderRadius:12,widgetConfig:{title:"RESEPSI PERNIKAHAN",eventTime:"07:00 PM - 10:00 PM",eventLocationName:"The Ritz-Carlton Ballroom, Jakarta"}}},hero:{classic:{name:"Classic Gold Title Cover",elements:[{name:"Cover Title",type:"text",text:"YOU ARE INVITED",fontFamily:"Montserrat",fontSize:10,fontWeight:"500",textColor:"#8C7A5B",textAlign:"center",letterSpacing:4,width:300,height:25},{name:"Bride & Groom Initials",type:"text",text:"S & W",fontFamily:"Cinzel",fontSize:48,fontWeight:"600",textColor:"#D4AF37",textAlign:"center",width:300,height:65}]},rustic:{name:"Earthy Javanese Cover",elements:[{name:"Cover Title",type:"text",text:"UNDANGAN PERNIKAHAN",fontFamily:"Montserrat",fontSize:12,fontWeight:"600",textColor:"#8C7A5B",textAlign:"center",letterSpacing:4,width:300,height:30},{name:"Names",type:"text",text:"Aditya & Sekar",fontFamily:"Great Vibes",fontSize:40,textColor:"#2C1D11",textAlign:"center",width:300,height:60}]},emerald:{name:"Modern Botanical Cover",elements:[{name:"Cover Title",type:"text",text:"JOIN US TO CELEBRATE",fontFamily:"Inter",fontSize:10,fontWeight:"600",textColor:"#2E7D32",textAlign:"center",letterSpacing:3,width:300,height:25},{name:"Initials Big",type:"text",text:"A + S",fontFamily:"Playfair Display",fontSize:52,fontWeight:"700",textColor:"#0F5132",textAlign:"center",width:300,height:70}]},royal:{name:"Royal Mandala & Gold Cover",elements:[{name:"Cover Title",type:"text",text:"THE WEDDING INVITATION",fontFamily:"Montserrat",fontSize:10,fontWeight:"600",textColor:"#D4AF37",textAlign:"center",letterSpacing:4,width:300,height:30},{name:"Names",type:"text",text:"William & Sophia",fontFamily:"Great Vibes",fontSize:48,textColor:"#FFFFFF",textAlign:"center",width:300,height:60}]}},brideGroom:{classic:{name:"Classic Gold Profile Photo",elements:[{name:"Bride Portrait",type:"image",src:"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",width:120,height:120,borderRadius:60,borderColor:"#D4AF37",borderWidth:2},{name:"Groom Portrait",type:"image",src:"https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800",width:120,height:120,borderRadius:60,borderColor:"#D4AF37",borderWidth:2}]},rustic:{name:"Rustic Profile Photo Frame",elements:[{name:"Bride Portrait Warm",type:"image",src:"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",width:120,height:120,borderRadius:12,borderColor:"#8C7A5B",borderWidth:2},{name:"Groom Portrait Warm",type:"image",src:"https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800",width:120,height:120,borderRadius:12,borderColor:"#8C7A5B",borderWidth:2}]},emerald:{name:"Emerald Botanical Hexagon",elements:[{name:"Bride Portrait Green",type:"image",src:"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",width:120,height:120,borderRadius:60,borderColor:"#2E7D32",borderWidth:3},{name:"Groom Portrait Green",type:"image",src:"https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800",width:120,height:120,borderRadius:60,borderColor:"#2E7D32",borderWidth:3}]},royal:{name:"Royal Arch Gold Frame Profile",elements:[{name:"Bride Portrait Royal",type:"image",src:"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",width:120,height:150,borderRadius:60,borderColor:"#D4AF37",borderWidth:2,frameStyle:"classic_arch_gold"},{name:"Groom Portrait Royal",type:"image",src:"https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800",width:120,height:150,borderRadius:60,borderColor:"#D4AF37",borderWidth:2,frameStyle:"classic_arch_gold"}]}},story:{classic:{name:"Classic Gold Love Story",title:"OUR LOVE STORY",textColor:"#8C7A5B",fontFamily:"Cinzel"},rustic:{name:"Indonesian Rustic Kisah Cinta",title:"KISAH CINTA KAMI",textColor:"#2C1D11",fontFamily:"Montserrat"},emerald:{name:"Modern Botanical Love Story",title:"THE STORY OF US",textColor:"#0F5132",fontFamily:"Playfair Display"},royal:{name:"Royal Mandala Love Story",title:"OUR LOVE JOURNEY",textColor:"#D4AF37",fontFamily:"Cinzel"}},footer:{classic:{name:"Classic Gold Closing Signature",text:`SOPHIA & WILLIAM
— See you at the celebration! —`,textColor:"#8C7A5B",fontFamily:"Montserrat"},rustic:{name:"Earthy Javanese Closing Signature",text:`Aditya & Sekar
— Tiada kesan tanpa kehadiranmu —`,textColor:"#2C1D11",fontFamily:"Great Vibes"},emerald:{name:"Modern Emerald Closing",text:`Sophia & William
— Share our joy and memories —`,textColor:"#0F5132",fontFamily:"Inter"},royal:{name:"Royal Classic Gold Signature",text:`WILLIAM & SOPHIA
— Tiada kesan tanpa kehadiranmu —`,textColor:"#D4AF37",fontFamily:"Montserrat"}},gallery:{classic:{name:"Dynamic Slide Gallery",backgroundColor:"#FFFFFF",borderColor:"#D4AF37",borderWidth:1,borderRadius:12,widgetConfig:{images:["https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=600"]}},rustic:{name:"Earthy Rustic Slide Gallery",backgroundColor:"#FFF9E6",borderColor:"#8C7A5B",borderWidth:1.5,borderRadius:8,widgetConfig:{images:["https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=600"]}},emerald:{name:"Emerald Modern Slide Gallery",backgroundColor:"#F4FAF7",borderColor:"#0F5132",borderWidth:1,borderRadius:16,widgetConfig:{images:["https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=600"]}},royal:{name:"Royal Dark Gold Slide Gallery",backgroundColor:"#111625",borderColor:"#D4AF37",borderWidth:1.5,borderRadius:20,widgetConfig:{images:["https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600","https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=600"]}}},video:{classic:{name:"Classic Gold Video Player",backgroundColor:"#FFFFFF",borderColor:"#D4AF37",borderWidth:1,borderRadius:12,widgetConfig:{videoUrl:"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}},rustic:{name:"Rustic Earthy Video Player",backgroundColor:"#FFF9E6",borderColor:"#8C7A5B",borderWidth:1.5,borderRadius:8,widgetConfig:{videoUrl:"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}},emerald:{name:"Emerald Modern Video Player",backgroundColor:"#F4FAF7",borderColor:"#0F5132",borderWidth:1,borderRadius:16,widgetConfig:{videoUrl:"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}},royal:{name:"Royal Dark Gold Video Player",backgroundColor:"#111625",borderColor:"#D4AF37",borderWidth:1.5,borderRadius:20,widgetConfig:{videoUrl:"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}}}};

