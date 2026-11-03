/**
 * SERVZ'IT Tri-lingual Localization System
 * Supported Languages: English (en), Telugu (te), Hindi (hi)
 */

export type Language = 'en' | 'te' | 'hi';

export interface Translations {
  // Navigation & Tabs
  tabHome: string;
  tabExplore: string;
  tabBookings: string;
  tabInbox: string;
  tabProfile: string;

  // Header & Location
  yourNeighbourhood: string;
  changeLocation: string;
  detectingLocation: string;
  useCurrentLocation: string;
  selectAreaModalTitle: string;
  searchAreaPlaceholder: string;

  // Role Switcher
  customerMode: string;
  providerMode: string;
  switchToProvider: string;
  switchToCustomer: string;
  partnerDashboard: string;
  partnerWelcome: string;
  onlineStatus: string;
  offlineStatus: string;
  goOnline: string;
  goOffline: string;

  // Onboarding Role Select
  welcomeToServzit: string;
  chooseRoleTitle: string;
  iNeedService: string;
  iNeedServiceDesc: string;
  iOfferService: string;
  iOfferServiceDesc: string;
  continueBtn: string;

  // Home Screen
  searchPlaceholder: string;
  whatDoYouNeed: string;
  servicesAndRepairs: string;
  seeAll: string;
  quickFixes: string;
  popularInArea: string;
  verifiedPros: string;
  topRatedNearYou: string;
  startingAt: string;
  bookNow: string;
  viewProfile: string;
  localShops: string;
  propertiesAndRentals: string;
  customerPromise: string;
  customerPromiseDesc: string;

  // Provider Card & Badges
  verifiedBadge: string;
  availableNow: string;
  outsideHours: string;
  inspectionFee: string;
  fromPrice: string;
  reviewsCount: string;

  // Search Screen
  searchTitle: string;
  filterVerifiedOnly: string;
  filterRating: string;
  filterDistance: string;
  recentSearches: string;
  clearAll: string;
  trendingSearches: string;
  noResults: string;
  noResultsDesc: string;

  // Booking Flow
  bookAppointment: string;
  stepOf: string;
  problemHeading: string;
  problemDesc: string;
  problemNotesPlaceholder: string;
  whenArrive: string;
  selectDate: string;
  selectSlot: string;
  whereArrive: string;
  savedAddresses: string;
  addNewAddress: string;
  reviewConfirm: string;
  priceBreakdown: string;
  serviceInspectionCharge: string;
  safetyInsurance: string;
  visitingFee: string;
  free: string;
  totalPayable: string;
  payAfterServiceNote: string;
  confirmBookingBtn: string;
  bookingSuccessTitle: string;
  bookingSuccessDesc: string;
  trackLiveBooking: string;
  returnHome: string;

  // Bookings & Tracking
  myBookings: string;
  activeService: string;
  requestPlaced: string;
  providerAccepted: string;
  confirmed: string;
  onTheWay: string;
  workInProgress: string;
  jobCompleted: string;
  chatWithPro: string;
  callTech: string;

  // Settings & Profile
  myAccount: string;
  appLanguage: string;
  savedAddressesMenu: string;
  paymentsMenu: string;
  favoriteProsMenu: string;
  helpSupportMenu: string;
  privacyMenu: string;
  logOut: string;
  signInRegister: string;

  // Partner Specific
  todayEarnings: string;
  pendingRequests: string;
  completedJobsToday: string;
  acceptJob: string;
  rejectJob: string;
  myServicesPricing: string;
  weeklySchedule: string;
  kycVerification: string;
  kycApproved: string;
  kycPending: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    tabHome: 'Home',
    tabExplore: 'Explore',
    tabBookings: 'Bookings',
    tabInbox: 'Inbox',
    tabProfile: 'Profile',

    yourNeighbourhood: 'YOUR NEIGHBOURHOOD',
    changeLocation: 'Change Location',
    detectingLocation: 'Detecting GPS location...',
    useCurrentLocation: 'Use My Current Location',
    selectAreaModalTitle: 'Select Your Premises / Locality',
    searchAreaPlaceholder: 'Search locality in Hyderabad / AP...',

    customerMode: 'Customer Mode',
    providerMode: 'Partner Mode',
    switchToProvider: 'Switch to Partner Mode ⚡',
    switchToCustomer: 'Switch to Customer Mode 🏠',
    partnerDashboard: 'Partner Dashboard',
    partnerWelcome: 'Welcome Partner',
    onlineStatus: 'Online • Accepting Jobs',
    offlineStatus: 'Offline • Paused',
    goOnline: 'Go Online',
    goOffline: 'Go Offline',

    welcomeToServzit: "Welcome to SERVZ'IT",
    chooseRoleTitle: 'How would you like to continue today?',
    iNeedService: 'I need a service',
    iNeedServiceDesc: 'Book verified electricians, plumbers, AC technicians, cleaning & home pros.',
    iOfferService: 'I provide services / run a business',
    iOfferServiceDesc: 'Accept customer bookings, receive service leads, set working hours and grow earnings.',
    continueBtn: 'Continue',

    searchPlaceholder: "Search 'Electrician', 'AC Service', 'Plumber'...",
    whatDoYouNeed: 'WHAT DO YOU NEED?',
    servicesAndRepairs: 'Services & Home Care',
    seeAll: 'See All',
    quickFixes: 'QUICK FIXES',
    popularInArea: 'Popular in your area',
    verifiedPros: 'VERIFIED PARTNERS',
    topRatedNearYou: 'Top Rated Near You',
    startingAt: 'STARTING AT',
    bookNow: 'Book Now',
    viewProfile: 'View Details',
    localShops: 'Local Stores & Businesses',
    propertiesAndRentals: 'Properties & Rentals',
    customerPromise: "SERVZ'IT Customer Promise",
    customerPromiseDesc: 'KYC-verified technicians, fixed upfront pricing, and pay only after job completion.',

    verifiedBadge: 'Verified',
    availableNow: 'Available Now',
    outsideHours: 'Outside Hours',
    inspectionFee: 'Inspection Fee',
    fromPrice: 'From',
    reviewsCount: 'reviews',

    searchTitle: 'Universal Search',
    filterVerifiedOnly: '✓ Verified Only',
    filterRating: '★ 4.8+ Rating',
    filterDistance: 'Under 2 km',
    recentSearches: 'Recent Searches',
    clearAll: 'Clear All',
    trendingSearches: 'Trending Near You',
    noResults: 'No results found',
    noResultsDesc: 'Try searching for general terms like electrician, AC repair, or plumbing.',

    bookAppointment: 'Book Appointment',
    stepOf: 'Step',
    problemHeading: 'What issue are you facing?',
    problemDesc: 'Select quick tags or describe the issue to help the technician arrive with right tools.',
    problemNotesPlaceholder: 'Add optional notes (e.g. Master bedroom switchboard is sparking)...',
    whenArrive: 'When should we arrive?',
    selectDate: 'SELECT DATE',
    selectSlot: 'AVAILABLE TIME SLOTS',
    whereArrive: 'Where should the pro arrive?',
    savedAddresses: 'Saved Addresses',
    addNewAddress: '+ Add New Address',
    reviewConfirm: 'Review & Confirm',
    priceBreakdown: 'PRICE BREAKDOWN',
    serviceInspectionCharge: 'Service Inspection Charge',
    safetyInsurance: 'Safety & Technician Insurance',
    visitingFee: 'Visiting Fee',
    free: 'FREE',
    totalPayable: 'Total Amount Payable',
    payAfterServiceNote: 'Pay After Service: Pay via UPI or Cash directly after work is completed.',
    confirmBookingBtn: 'Confirm Booking Request',
    bookingSuccessTitle: 'Booking Request Placed!',
    bookingSuccessDesc: 'Your request has been sent. The technician will be assigned immediately.',
    trackLiveBooking: 'Track Live Booking',
    returnHome: 'Return to Home',

    myBookings: 'My Bookings',
    activeService: 'ACTIVE SERVICE',
    requestPlaced: 'Request Placed',
    providerAccepted: 'Provider Accepted',
    confirmed: 'Appointment Confirmed',
    onTheWay: 'Professional on the Way',
    workInProgress: 'Work in Progress',
    jobCompleted: 'Work Completed & Confirmed',
    chatWithPro: '💬 Chat with Pro',
    callTech: '📞 Call Technician',

    myAccount: 'MY ACCOUNT',
    appLanguage: 'App Language',
    savedAddressesMenu: 'Saved Addresses',
    paymentsMenu: 'Payment History & Receipts',
    favoriteProsMenu: 'Favorite Professionals',
    helpSupportMenu: 'Help Center & Safety Guarantee',
    privacyMenu: 'Privacy & Terms',
    logOut: "Log Out from SERVZ'IT",
    signInRegister: 'Sign In / Register with OTP',

    todayEarnings: "Today's Earnings",
    pendingRequests: 'Booking Requests',
    completedJobsToday: 'Jobs Completed',
    acceptJob: 'Accept Job',
    rejectJob: 'Decline',
    myServicesPricing: 'My Services & Rates',
    weeklySchedule: 'Weekly Availability',
    kycVerification: 'KYC & Verification',
    kycApproved: 'Verified Partner ✓',
    kycPending: 'Verification in Review ⏳',
  },

  te: {
    tabHome: 'హోమ్',
    tabExplore: 'ఎక్స్‌ప్లోర్',
    tabBookings: 'బుకింగ్స్',
    tabInbox: 'ఇన్‌బాక్స్',
    tabProfile: 'ప్రొఫైల్',

    yourNeighbourhood: 'మీ ప్రాంతం',
    changeLocation: 'లొకేషన్ మార్చండి',
    detectingLocation: 'లొకేషన్ గుర్తిస్తున్నాము...',
    useCurrentLocation: 'నా ప్రస్తుత లొకేషన్ ఉపయోగించు',
    selectAreaModalTitle: 'మీ ప్రాంతాన్ని / ఏరియాను ఎంచుకోండి',
    searchAreaPlaceholder: 'హైదరాబాద్ / ఏపీ లో ప్రాంతం వెతకండి...',

    customerMode: 'కస్టమర్ మోడ్',
    providerMode: 'పార్ట్‌నర్ మోడ్',
    switchToProvider: 'పార్ట్‌నర్ మోడ్‌కి మారండి ⚡',
    switchToCustomer: 'కస్టమర్ మోడ్‌కి మారండి 🏠',
    partnerDashboard: 'పార్ట్‌నర్ డ్యాష్‌బోర్డ్',
    partnerWelcome: 'స్వాగతం పార్ట్‌నర్',
    onlineStatus: 'ఆన్‌లైన్ • ఆర్డర్‌లు స్వీకరిస్తున్నారు',
    offlineStatus: 'ఆఫ్‌లైన్ • నిలిపివేయబడింది',
    goOnline: 'ఆన్‌లైన్ వెళ్లండి',
    goOffline: 'ఆఫ్‌లైన్ అవ్వండి',

    welcomeToServzit: "SERVZ'IT కి స్వాగతం",
    chooseRoleTitle: 'మీరు ఎలా కొనసాగాలనుకుంటున్నారు?',
    iNeedService: 'నాకు సర్వీస్ కావాలి',
    iNeedServiceDesc: 'ఎలక్ట్రీషియన్, ప్లంబర్, ఏసీ రిపేర్, క్లీనింగ్ నిపుణులను బుక్ చేసుకోండి.',
    iOfferService: 'నేను సర్వీసులు అందిస్తాను / వ్యాపారిని',
    iOfferServiceDesc: 'కస్టమర్ బుకింగ్స్ స్వీకరించండి, పని వేళలు నిర్ణయించి ఆదాయం పెంచుకోండి.',
    continueBtn: 'కొనసాగించండి',

    searchPlaceholder: "ఎలక్ట్రీషియన్, ఏసీ సర్వీస్, ప్లంబర్ వెతకండి...",
    whatDoYouNeed: 'మీకు ఏమి కావాలి?',
    servicesAndRepairs: 'సేవలు & ఇంటి నిర్వహణ',
    seeAll: 'అన్నీ చూడండి',
    quickFixes: 'త్వరిత సేవలు',
    popularInArea: 'మీ ప్రాంతంలో ప్రసిద్ధమైనవి',
    verifiedPros: 'ధృవీకరించబడిన నిపుణులు',
    topRatedNearYou: 'మీ దగ్గర అత్యుత్తమ రేటింగ్ కలవారు',
    startingAt: 'ప్రారంభ ధర',
    bookNow: 'ఇప్పుడే బుక్ చేయండి',
    viewProfile: 'వివరాలు చూడండి',
    localShops: 'స్థానిక దుకాణాలు & వ్యాపారాలు',
    propertiesAndRentals: 'ఆస్తులు & అద్దె ఇళ్ళు',
    customerPromise: "SERVZ'IT కస్టమర్ భరోసా",
    customerPromiseDesc: 'కేవైసీ ధృవీకరణ గల నిపుణులు, ముందస్తు ధర స్పష్టత, పని పూర్తయిన తర్వాతే చెల్లింపు.',

    verifiedBadge: 'ధృవీకరించబడింది',
    availableNow: 'అందుబాటులో ఉన్నారు',
    outsideHours: 'పనివేళలు దాటింది',
    inspectionFee: 'తనిఖీ రుసుము',
    fromPrice: 'నుండి',
    reviewsCount: 'రివ్యూలు',

    searchTitle: 'సమగ్ర శోధన',
    filterVerifiedOnly: '✓ ధృవీకరించినవి మాత్రమే',
    filterRating: '★ 4.8+ రేటింగ్',
    filterDistance: '2 కి.మీ లోపల',
    recentSearches: 'ఇటీవలి శోధనలు',
    clearAll: 'అన్నీ క్లియర్ చేయండి',
    trendingSearches: 'ప్రస్తుతం ట్రెండింగ్ లో ఉన్నవి',
    noResults: 'ఫలితాలు కనుగొనబడలేదు',
    noResultsDesc: 'ఎలక్ట్రీషియన్, ప్లంబర్ వంటి సాధారణ పదాలతో వెతకండి.',

    bookAppointment: 'అపాయింట్‌మెంట్ బుక్ చేయండి',
    stepOf: 'దశ',
    problemHeading: 'మీరు ఎదుర్కొంటున్న సమస్య ఏమిటి?',
    problemDesc: 'నిపుణుడు సరైన సాధనాలతో రావడానికి సమస్యను వివరించండి.',
    problemNotesPlaceholder: 'సమస్య వివరాలు రాయండి (ఉదా: స్విచ్ బోర్డు నుండి పొగ వస్తోంది)...',
    whenArrive: 'ఎప్పుడు రావాలి?',
    selectDate: 'తేదీ ఎంచుకోండి',
    selectSlot: 'అందుబాటులో ఉన్న సమయాలు',
    whereArrive: 'సర్వీస్ ఎక్కడ అందించాలి?',
    savedAddresses: 'సేవ్ చేసిన చిరునామాలు',
    addNewAddress: '+ కొత్త చిరునామా జోడించండి',
    reviewConfirm: 'పరిశీలించి నిర్ధారించండి',
    priceBreakdown: 'ధరల వివరాలు',
    serviceInspectionCharge: 'సర్వీస్ తనిఖీ చార్జ్',
    safetyInsurance: 'భద్రతా రుసుము',
    visitingFee: 'సందర్శన రుసుము',
    free: 'ఉచితం',
    totalPayable: 'మొత్తం చెల్లించవలసిన మొత్తం',
    payAfterServiceNote: 'పని ముగిశాక చెల్లించండి: పని నచ్చిన తర్వాత యూపీఐ లేదా నగదు ద్వారా చెల్లించండి.',
    confirmBookingBtn: 'బుకింగ్ నిర్ధారించండి',
    bookingSuccessTitle: 'బుకింగ్ విజయవంతమైంది!',
    bookingSuccessDesc: 'మీ అభ్యర్థన చేరింది. త్వరలోనే టెక్నీషియన్ నియమించబడతారు.',
    trackLiveBooking: 'లైవ్ స్టేటస్ ట్రాక్ చేయండి',
    returnHome: 'హోమ్ కి వెళ్లండి',

    myBookings: 'నా బుకింగ్స్',
    activeService: 'ప్రస్తుత సేవ',
    requestPlaced: 'అభ్యర్థన పంపబడింది',
    providerAccepted: 'పార్ట్‌నర్ ఆమోదించారు',
    confirmed: 'అపాయింట్‌మెంట్ ఖరారైంది',
    onTheWay: 'నిపుణుడు వస్తున్నారు',
    workInProgress: 'పని జరుగుతోంది',
    jobCompleted: 'పని పూర్తయింది & ధృవీకరించబడింది',
    chatWithPro: '💬 చాట్ చేయండి',
    callTech: '📞 కాల్ చేయండి',

    myAccount: 'నా ఖాతా',
    appLanguage: 'యాప్ భాష',
    savedAddressesMenu: 'సేవ్ చేసిన చిరునామాలు',
    paymentsMenu: 'చెల్లింపు రసీదులు',
    favoriteProsMenu: 'ఇష్టమైన నిపుణులు',
    helpSupportMenu: 'సహాయ కేంద్రం & భరోసా',
    privacyMenu: 'గోప్యతా నిబంధనలు',
    logOut: "SERVZ'IT నుండి లాగ్ అవుట్",
    signInRegister: 'ఓటీపీతో సైన్ ఇన్ అవ్వండి',

    todayEarnings: 'నేటి సంపాదన',
    pendingRequests: 'వచ్చిన బుకింగ్స్',
    completedJobsToday: 'పూర్తయిన పనులు',
    acceptJob: 'ఆమోదించు',
    rejectJob: 'తిరస్కరించు',
    myServicesPricing: 'నా సేవలు & ధరలు',
    weeklySchedule: 'వారపు పనివేళలు',
    kycVerification: 'కేవైసీ స్థితి',
    kycApproved: 'ధృవీకరించబడిన పార్ట్‌నర్ ✓',
    kycPending: 'పరిశీలనలో ఉంది ⏳',
  },

  hi: {
    tabHome: 'होम',
    tabExplore: 'एक्सप्लोर',
    tabBookings: 'बुकिंग्स',
    tabInbox: 'इनबॉक्स',
    tabProfile: 'प्रोफाइल',

    yourNeighbourhood: 'आपका इलाका',
    changeLocation: 'स्थान बदलें',
    detectingLocation: 'स्थान खोज रहे हैं...',
    useCurrentLocation: 'मेरा वर्तमान स्थान चुनें',
    selectAreaModalTitle: 'अपना इलाका / क्षेत्र चुनें',
    searchAreaPlaceholder: 'हैदराबाद / एपी में इलाका खोजें...',

    customerMode: 'ग्राहक मोड',
    providerMode: 'पार्टनर मोड',
    switchToProvider: 'पार्टनर मोड पर जाएं ⚡',
    switchToCustomer: 'ग्राहक मोड पर जाएं 🏠',
    partnerDashboard: 'पार्टनर डैशबोर्ड',
    partnerWelcome: 'नमस्ते पार्टनर',
    onlineStatus: 'ऑनलाइन • बुकिंग स्वीकार कर रहे हैं',
    offlineStatus: 'ऑफलाइन • रोका गया',
    goOnline: 'ऑनलाइन जाएं',
    goOffline: 'ऑफलाइन जाएं',

    welcomeToServzit: "SERVZ'IT में आपका स्वागत है",
    chooseRoleTitle: 'आप आज किस रूप में उपयोग करना चाहते हैं?',
    iNeedService: 'मुझे सेवा चाहिए (ग्राहक)',
    iNeedServiceDesc: 'इलेक्ट्रीशियन, प्लंबर, एसी रिपेयर, कारपेंटर और सफाई विशेषज्ञ बुक करें।',
    iOfferService: 'मैं सेवा प्रदान करता हूँ (पार्टनर / कारीगर)',
    iOfferServiceDesc: 'ग्राहकों की बुकिंग स्वीकार करें, कार्य समय चुनें और अपनी कमाई बढ़ाएं।',
    continueBtn: 'आगे बढ़ें',

    searchPlaceholder: "इलेक्ट्रीशियन, एसी रिपेयर, प्लंबर खोजें...",
    whatDoYouNeed: 'आपको किस सेवा की आवश्यकता है?',
    servicesAndRepairs: 'घरेलू सेवाएं एवं मरम्मत',
    seeAll: 'सभी देखें',
    quickFixes: 'त्वरित सेवाएं',
    popularInArea: 'आपके क्षेत्र में लोकप्रिय',
    verifiedPros: 'प्रमाणित कारीगर',
    topRatedNearYou: 'शीर्ष रेटिंग वाले प्रोफेशनल्स',
    startingAt: 'शुरुआती कीमत',
    bookNow: 'अभी बुक करें',
    viewProfile: 'विवरण देखें',
    localShops: 'स्थानीय दुकानें और व्यवसाय',
    propertiesAndRentals: 'प्रॉपर्टी और किराए के मकान',
    customerPromise: "SERVZ'IT ग्राहक सुरक्षा गारंटी",
    customerPromiseDesc: 'केवाईसी सत्यापित कारीगर, पारदर्शी मूल्य और काम पूरा होने के बाद ही भुगतान।',

    verifiedBadge: 'सत्यापित',
    availableNow: 'उपलब्ध हैं',
    outsideHours: 'समय समाप्त',
    inspectionFee: 'निरीक्षण शुल्क',
    fromPrice: 'से',
    reviewsCount: 'समीक्षाएं',

    searchTitle: 'खोजें',
    filterVerifiedOnly: '✓ केवल सत्यापित',
    filterRating: '★ 4.8+ रेटिंग',
    filterDistance: '2 किमी के भीतर',
    recentSearches: 'हाल की खोजें',
    clearAll: 'सभी हटाएं',
    trendingSearches: 'लोकप्रिय सेवाएं',
    noResults: 'कोई परिणाम नहीं मिला',
    noResultsDesc: 'इलेक्ट्रीशियन, प्लंबर या एसी रिपेयर जैसे सामान्य शब्द खोजें।',

    bookAppointment: 'अपॉइंटमेंट बुक करें',
    stepOf: 'चरण',
    problemHeading: 'आपको क्या समस्या आ रही है?',
    problemDesc: 'समस्या का संक्षिप्त विवरण दें ताकि कारीगर सही उपकरणों के साथ आएं।',
    problemNotesPlaceholder: 'समस्या का विवरण लिखें (उदा: स्विचबोर्ड से चिंगारी निकल रही है)...',
    whenArrive: 'कारीगर को कब आना चाहिए?',
    selectDate: 'दिनांक चुनें',
    selectSlot: 'उपलब्ध समय स्लॉट',
    whereArrive: 'सेवा कहाँ प्रदान करनी है?',
    savedAddresses: 'सहेजे गए पते',
    addNewAddress: '+ नया पता जोड़ें',
    reviewConfirm: 'समीक्षा और पुष्टि',
    priceBreakdown: 'मूल्य विवरण',
    serviceInspectionCharge: 'निरीक्षण शुल्क',
    safetyInsurance: 'सुरक्षा और बीमा शुल्क',
    visitingFee: 'विजिटिंग शुल्क',
    free: 'मुफ्त',
    totalPayable: 'कुल देय राशि',
    payAfterServiceNote: 'काम के बाद भुगतान: PhonePe, UPI या नकद द्वारा काम पूरा होने के बाद ही भुगतान करें।',
    confirmBookingBtn: 'बुकिंग की पुष्टि करें',
    bookingSuccessTitle: 'बुकिंग अनुरोध दर्ज हुआ!',
    bookingSuccessDesc: 'आपका अनुरोध भेज दिया गया है। कारीगर को जल्द ही नियुक्त किया जाएगा।',
    trackLiveBooking: 'लाइव स्टेटस देखें',
    returnHome: 'होम पर जाएं',

    myBookings: 'मेरी बुकिंग्स',
    activeService: 'सक्रिय सेवा',
    requestPlaced: 'अनुरोध भेजा गया',
    providerAccepted: 'पार्टनर ने स्वीकार किया',
    confirmed: 'अपॉइंटमेंट पक्की हुई',
    onTheWay: 'कारीगर रास्ते में हैं',
    workInProgress: 'काम चल रहा है',
    jobCompleted: 'काम पूरा और सत्यापित हुआ',
    chatWithPro: '💬 चैट करें',
    callTech: '📞 कॉल करें',

    myAccount: 'मेरा खाता',
    appLanguage: 'ऐप की भाषा',
    savedAddressesMenu: 'सहेजे गए पते',
    paymentsMenu: 'भुगतान रसीदें',
    favoriteProsMenu: 'पसंदीदा कारीगर',
    helpSupportMenu: 'सहायता केंद्र और गारंटी',
    privacyMenu: 'गोपनीयता और शर्तें',
    logOut: "SERVZ'IT से लॉग आउट करें",
    signInRegister: 'ओटीपी से साइन इन करें',

    todayEarnings: 'आज की कमाई',
    pendingRequests: 'नए बुकिंग अनुरोध',
    completedJobsToday: 'पूर्ण किए गए कार्य',
    acceptJob: 'स्वीकार करें',
    rejectJob: 'अस्वीकार करें',
    myServicesPricing: 'मेरी सेवाएं और दरें',
    weeklySchedule: 'साप्ताहिक कार्य समय',
    kycVerification: 'केवाईसी सत्यापन स्थिति',
    kycApproved: 'सत्यापित पार्टनर ✓',
    kycPending: 'सत्यापन प्रक्रियाधीन ⏳',
  },
};

