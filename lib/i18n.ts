import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

// English translations
const en = {
  // Common
  common: {
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    search: 'Search',
    noResults: 'No results found',
    seeAll: 'See All',
  },

  // Auth
  auth: {
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    phone: 'Phone Number',
    otp: 'Enter OTP',
    otpSent: 'OTP sent to your phone',
    verifyOtp: 'Verify OTP',
    resendOtp: 'Resend OTP',
    welcome: 'Welcome to Washman',
    welcomeBack: 'Welcome Back',
  },

  // Navigation
  nav: {
    home: 'Home',
    orders: 'Orders',
    profile: 'Profile',
    services: 'Services',
  },

  // Home
  home: {
    greeting: 'Hello',
    bookNow: 'Book Now',
    recentOrders: 'Recent Orders',
    viewAll: 'View All',
    location: 'Your Location',
    noLocation: 'Add a location',
  },

  // Services
  services: {
    title: 'Services',
    carWash: 'Car Wash',
    boatServices: 'Boat Services',
    comingSoon: 'Coming Soon',
    recommended: 'Recommended',
    exteriorInterior: 'Exterior + Interior',
    exteriorOnly: 'Exterior Only',
    interiorOnly: 'Interior Only',
    minutes: 'min',
    bookNow: 'Book Now',
  },

  // Booking
  booking: {
    title: 'Book Service',
    selectVehicle: 'Select Vehicle',
    selectWashType: 'Select Wash Type',
    selectDateTime: 'Select Date & Time',
    selectPayment: 'Select Payment',
    confirmBooking: 'Confirm Booking',
    fullWash: 'Full Wash',
    exteriorOnly: 'Exterior Only',
    interiorOnly: 'Interior Only',
    step: 'Step',
    of: 'of',
    continue: 'Continue',
    addVehicle: 'Add Vehicle',
    noVehicles: 'No vehicles added yet',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    noSlots: 'No available slots',
    specialInstructions: 'Special Instructions',
    optional: 'Optional',
    promoCode: 'Promo Code',
    apply: 'Apply',
    subtotal: 'Subtotal',
    addons: 'Add-ons',
    discount: 'Discount',
    total: 'Total',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    card: 'Credit/Debit Card',
    confirmAndPay: 'Confirm & Pay',
    bookingConfirmed: 'Booking Confirmed!',
    orderNumber: 'Order Number',
    viewOrder: 'View Order',
  },

  // Orders
  orders: {
    title: 'My Orders',
    active: 'Active',
    completed: 'Completed',
    noOrders: 'No orders yet',
    bookFirst: 'Book your first car wash!',
    orderDetails: 'Order Details',
    status: {
      pending: 'Pending',
      confirmed: 'Confirmed',
      assigned: 'Washer Assigned',
      on_the_way: 'On The Way',
      arrived: 'Arrived',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    trackOrder: 'Track Order',
    cancelOrder: 'Cancel Order',
    rateOrder: 'Rate Your Experience',
  },

  // Profile
  profile: {
    title: 'Profile',
    editProfile: 'Edit Profile',
    myVehicles: 'My Vehicles',
    myLocations: 'My Locations',
    membership: 'Membership',
    settings: 'Settings',
    darkMode: 'Dark Mode',
    language: 'Language',
    notifications: 'Notifications',
    help: 'Help & Support',
    about: 'About Washman',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    deleteAccount: 'Delete Account',
  },

  // Vehicles
  vehicles: {
    title: 'My Vehicles',
    addVehicle: 'Add Vehicle',
    make: 'Make',
    model: 'Model',
    year: 'Year',
    type: 'Type',
    plate: 'Plate Number',
    color: 'Color',
    sedan: 'Sedan',
    suv: 'SUV',
    luxury: 'Luxury',
    setDefault: 'Set as Default',
    default: 'Default',
  },

  // Locations
  locations: {
    title: 'My Locations',
    addLocation: 'Add Location',
    home: 'Home',
    work: 'Work',
    other: 'Other',
    label: 'Label',
    address: 'Address',
    city: 'City',
    setDefault: 'Set as Default',
    default: 'Default',
    useCurrentLocation: 'Use Current Location',
    inServiceArea: 'In Service Area',
    outsideServiceArea: 'Outside Service Area',
    checkingArea: 'Checking service area...',
    areaWarning: 'This location is outside our service area. You may not be able to book from here.',
  },

  // Membership
  membership: {
    title: 'Membership',
    joinNow: 'Join Now',
    currentPlan: 'Current Plan',
    washesRemaining: 'Washes Remaining',
    expiresOn: 'Expires On',
    renew: 'Renew',
    upgrade: 'Upgrade',
    benefits: 'Benefits',
    popular: 'Most Popular',
  },
};

// Arabic translations
const ar = {
  // Common
  common: {
    loading: 'جاري التحميل...',
    error: 'حدث خطأ ما',
    retry: 'إعادة المحاولة',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    back: 'رجوع',
    next: 'التالي',
    done: 'تم',
    search: 'بحث',
    noResults: 'لا توجد نتائج',
    seeAll: 'عرض الكل',
  },

  // Auth
  auth: {
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    phone: 'رقم الهاتف',
    otp: 'أدخل رمز التحقق',
    otpSent: 'تم إرسال رمز التحقق إلى هاتفك',
    verifyOtp: 'تحقق من الرمز',
    resendOtp: 'إعادة إرسال الرمز',
    welcome: 'مرحباً بك في واشمان',
    welcomeBack: 'مرحباً بعودتك',
  },

  // Navigation
  nav: {
    home: 'الرئيسية',
    orders: 'الطلبات',
    profile: 'حسابي',
    services: 'الخدمات',
  },

  // Home
  home: {
    greeting: 'مرحباً',
    bookNow: 'احجز الآن',
    recentOrders: 'الطلبات الأخيرة',
    viewAll: 'عرض الكل',
    location: 'موقعك',
    noLocation: 'أضف موقع',
  },

  // Services
  services: {
    title: 'الخدمات',
    carWash: 'غسيل السيارات',
    boatServices: 'خدمات القوارب',
    comingSoon: 'قريباً',
    recommended: 'موصى به',
    exteriorInterior: 'خارجي + داخلي',
    exteriorOnly: 'خارجي فقط',
    interiorOnly: 'داخلي فقط',
    minutes: 'دقيقة',
    bookNow: 'احجز الآن',
  },

  // Booking
  booking: {
    title: 'احجز الخدمة',
    selectVehicle: 'اختر السيارة',
    selectWashType: 'اختر نوع الغسيل',
    selectDateTime: 'اختر التاريخ والوقت',
    selectPayment: 'اختر طريقة الدفع',
    confirmBooking: 'تأكيد الحجز',
    fullWash: 'غسيل كامل',
    exteriorOnly: 'خارجي فقط',
    interiorOnly: 'داخلي فقط',
    step: 'الخطوة',
    of: 'من',
    continue: 'متابعة',
    addVehicle: 'أضف سيارة',
    noVehicles: 'لا توجد سيارات مضافة',
    selectDate: 'اختر التاريخ',
    selectTime: 'اختر الوقت',
    noSlots: 'لا توجد مواعيد متاحة',
    specialInstructions: 'تعليمات خاصة',
    optional: 'اختياري',
    promoCode: 'كود الخصم',
    apply: 'تطبيق',
    subtotal: 'المجموع الفرعي',
    addons: 'الإضافات',
    discount: 'الخصم',
    total: 'الإجمالي',
    paymentMethod: 'طريقة الدفع',
    cash: 'نقداً',
    card: 'بطاقة ائتمان',
    confirmAndPay: 'تأكيد والدفع',
    bookingConfirmed: 'تم تأكيد الحجز!',
    orderNumber: 'رقم الطلب',
    viewOrder: 'عرض الطلب',
  },

  // Orders
  orders: {
    title: 'طلباتي',
    active: 'نشطة',
    completed: 'مكتملة',
    noOrders: 'لا توجد طلبات',
    bookFirst: 'احجز أول غسيل لسيارتك!',
    orderDetails: 'تفاصيل الطلب',
    status: {
      pending: 'قيد الانتظار',
      confirmed: 'تم التأكيد',
      assigned: 'تم التعيين',
      on_the_way: 'في الطريق',
      arrived: 'وصل',
      in_progress: 'جاري الغسيل',
      completed: 'مكتمل',
      cancelled: 'ملغي',
    },
    trackOrder: 'تتبع الطلب',
    cancelOrder: 'إلغاء الطلب',
    rateOrder: 'قيّم تجربتك',
  },

  // Profile
  profile: {
    title: 'حسابي',
    editProfile: 'تعديل الملف الشخصي',
    myVehicles: 'سياراتي',
    myLocations: 'مواقعي',
    membership: 'العضوية',
    settings: 'الإعدادات',
    darkMode: 'الوضع الداكن',
    language: 'اللغة',
    notifications: 'الإشعارات',
    help: 'المساعدة والدعم',
    about: 'عن واشمان',
    terms: 'شروط الخدمة',
    privacy: 'سياسة الخصوصية',
    deleteAccount: 'حذف الحساب',
  },

  // Vehicles
  vehicles: {
    title: 'سياراتي',
    addVehicle: 'أضف سيارة',
    make: 'الشركة المصنعة',
    model: 'الموديل',
    year: 'السنة',
    type: 'النوع',
    plate: 'رقم اللوحة',
    color: 'اللون',
    sedan: 'سيدان',
    suv: 'دفع رباعي',
    luxury: 'فاخرة',
    setDefault: 'تعيين كافتراضي',
    default: 'افتراضي',
  },

  // Locations
  locations: {
    title: 'مواقعي',
    addLocation: 'أضف موقع',
    home: 'المنزل',
    work: 'العمل',
    other: 'آخر',
    label: 'التسمية',
    address: 'العنوان',
    city: 'المدينة',
    setDefault: 'تعيين كافتراضي',
    default: 'افتراضي',
    useCurrentLocation: 'استخدم موقعي الحالي',
    inServiceArea: 'ضمن نطاق الخدمة',
    outsideServiceArea: 'خارج نطاق الخدمة',
    checkingArea: 'جاري التحقق من نطاق الخدمة...',
    areaWarning: 'هذا الموقع خارج نطاق خدمتنا. قد لا تتمكن من الحجز من هنا.',
  },

  // Membership
  membership: {
    title: 'العضوية',
    joinNow: 'اشترك الآن',
    currentPlan: 'الباقة الحالية',
    washesRemaining: 'الغسلات المتبقية',
    expiresOn: 'تنتهي في',
    renew: 'تجديد',
    upgrade: 'ترقية',
    benefits: 'المميزات',
    popular: 'الأكثر شعبية',
  },
};

// Create i18n instance
const i18n = new I18n({
  en,
  ar,
});

// Set the locale based on device settings
const locales = Localization.getLocales();
const deviceLocale = locales && locales.length > 0 ? locales[0].languageCode : 'en';
i18n.locale = deviceLocale === 'ar' ? 'ar' : 'en';

// Enable fallback
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Configure RTL based on locale
export const isRTL = i18n.locale === 'ar';

// Force RTL layout for Arabic (only on native)
if (typeof I18nManager !== 'undefined' && isRTL && !I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

// Helper function to change locale
export const setLocale = (locale: 'en' | 'ar') => {
  i18n.locale = locale;
  const shouldBeRTL = locale === 'ar';
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
  }
};

// Get current locale
export const getLocale = () => i18n.locale;

// Translation function
export const t = (key: string, options?: object) => {
  return i18n.t(key, options);
};

export default i18n;
