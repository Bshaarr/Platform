import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
// Replaced react-icons/fa with lucide-react and custom SVGs for better compatibility
import { X, Menu, Facebook, Instagram, Youtube, Robot, Chalkboard, GraduationCap, User, Baby, PencilRuler, Code, Paintbrush, Award, Users, List } from 'lucide-react';

// Firebase configuration provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyBT4YJcnZZUaUhKVvs7iMp5mdAeWRjixEfR", // Corrected the typo in the provided key, changed R to f
  authDomain: "platform-fd979.firebaseapp.com",
  projectId: "platform-fd979",
  storageBucket: "platform-fd979.firebasestorage.app",
  appId: "1:184754007748:web:a849462d9cb2bdb3a6e391",
  measurementId: "G-9FB64YHKM3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Context for Firebase services and user data
const AuthContext = createContext(null);

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
        // Check if the user is an admin
        // Query the 'admins' collection to find if the current user's UID exists
        const adminQuery = query(collection(db, `/artifacts/${appId}/admins`), where('uid', '==', currentUser.uid));
        const adminSnapshot = await getDocs(adminQuery);
        if (!adminSnapshot.empty) {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
      } else {
        setUser(null);
        setUserId(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Sign in on initial load for Canvas environment
    const signInUser = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase Auth Error:", error);
      }
    };
    signInUser();

    return () => unsubscribe();
  }, [appId]); // Added appId to dependencies for consistency

  return (
    <AuthContext.Provider value={{ user, userId, isAdmin, loading, auth, db, appId }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Modal Component
const CustomModal = ({ isOpen, onClose, title, message, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-right">{title}</h3>
        <p className="text-gray-600 mb-6 text-right">{message}</p>
        <div className="flex justify-end space-x-2 rtl:space-x-reverse">
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              تأكيد
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

// Social Media Links Component
const SocialLinks = () => (
  <div className="flex justify-center md:justify-start space-x-4 rtl:space-x-reverse text-gray-700">
    <a href="https://www.facebook.com/share/1GmdvSKcuU/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
      <Facebook className="w-6 h-6" />
    </a>
    <a href="https://www.instagram.com/morox732?igsh=ajBlbW1jdHpweTdu" target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 transition-colors">
      <Instagram className="w-6 h-6" />
    </a>
    <a href="https://youtube.com/@morox732?si=IXRA6Jv8ut7L5Bvb" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">
      <Youtube className="w-6 h-6" />
    </a>
  </div>
);

// Navigation Bar
const Navbar = ({ onNavigate, currentView, user, isAdmin, onSignOut }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Simple SVG for the robot icon in the navbar
  const RobotIconSVG = () => (
    <svg viewBox="0 0 200 200" className="w-8 h-8 text-white">
      <rect x="50" y="50" width="100" height="100" rx="20" ry="20" fill="currentColor"/>
      <circle cx="75" cy="80" r="10" fill="#fff"/>
      <circle cx="125" cy="80" r="10" fill="#fff"/>
      <rect x="70" y="120" width="60" height="10" rx="5" ry="5" fill="#fff"/>
      <rect x="60" y="150" width="10" height="20" rx="5" ry="5" fill="currentColor"/>
      <rect x="130" y="150" width="10" height="20" rx="5" ry="5" fill="currentColor"/>
      <rect x="30" y="80" width="10" height="40" rx="5" ry="5" fill="currentColor"/>
      <rect x="160" y="80" width="10" height="40" rx="5" ry="5" fill="currentColor"/>
    </svg>
  );

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 shadow-lg sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center flex-wrap">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <RobotIconSVG /> {/* Using custom SVG for robot icon */}
          <span className="text-2xl font-bold font-inter">Morox</span>
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:flex md:items-center md:space-x-6 rtl:space-x-reverse w-full md:w-auto mt-4 md:mt-0`}>
          <button onClick={() => { onNavigate('home'); setIsMenuOpen(false); }} className={`block py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors ${currentView === 'home' ? 'bg-blue-700' : ''}`}>
            الرئيسية
          </button>
          {user && !isAdmin && (
            <button onClick={() => { onNavigate('dashboard'); setIsMenuOpen(false); }} className={`block py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors ${currentView === 'dashboard' ? 'bg-blue-700' : ''}`}>
              لوحة تحكم الطالب
            </button>
          )}
          {isAdmin && (
            <button onClick={() => { onNavigate('admin'); setIsMenuOpen(false); }} className={`block py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors ${currentView === 'admin' ? 'bg-blue-700' : ''}`}>
              لوحة تحكم المدير
            </button>
          )}
          {user ? (
            <button onClick={() => { onSignOut(); setIsMenuOpen(false); }} className="block py-2 px-3 bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
              تسجيل الخروج
            </button>
          ) : (
            <button onClick={() => { onNavigate('login'); setIsMenuOpen(false); }} className={`block py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors ${currentView === 'login' ? 'bg-blue-700' : ''}`}>
              تسجيل الدخول / التسجيل
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

// Course Card Component
const CourseCard = ({ icon, title, description, isUpcoming = false }) => (
  <div className={`bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform duration-300 border ${isUpcoming ? 'border-dashed border-gray-400' : 'border-blue-200'}`}>
    <div className="text-blue-600 mb-4 flex justify-center">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2 font-inter">{title}</h3>
    <p className="text-gray-600 font-inter">{description}</p>
    {isUpcoming && (
      <span className="mt-4 inline-block bg-yellow-200 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full font-inter">
        قريباً
      </span>
    )}
  </div>
);

// Home Page Component
const Home = ({ onNavigate }) => {
  // Using custom SVG for WhatsApp icon due to no direct Lucide equivalent
  const WhatsappSVG = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.04 2C6.58 2 2.12 6.57 2.12 12.04C2.12 14.07 2.72 15.93 3.75 17.52L2.01 22.01L6.6 20.31C8.16 21.23 10.03 21.72 12.04 21.72C17.5 21.72 21.96 17.15 21.96 11.68C21.96 6.22 17.5 2 12.04 2ZM17.18 16.03C16.92 16.51 15.65 17.18 15.4 17.29C15.15 17.41 14.97 17.43 14.65 17.27C14.33 17.12 13.25 16.75 11.97 15.6C10.69 14.45 9.8 13.12 9.54 12.87C9.28 12.61 9.11 12.5 8.94 12.26C8.77 12.03 8.61 11.83 8.44 11.6C8.28 11.37 8.08 10.99 7.93 10.74C7.79 10.51 7.64 10.37 7.5 10.22C7.36 10.08 7.21 9.94 7.07 9.8C6.93 9.66 6.78 9.52 6.64 9.38C6.5 9.24 6.36 9.1 6.22 8.96C6.08 8.82 5.94 8.68 5.8 8.54C5.55 8.28 5.37 8.16 5.15 7.95C4.93 7.74 4.75 7.62 4.6 7.5C4.45 7.37 4.29 7.27 4.13 7.16C3.98 7.05 3.82 6.95 3.66 6.84C3.51 6.74 3.35 6.63 3.19 6.53C3.04 6.43 2.88 6.33 2.72 6.23C2.57 6.13 2.41 6.03 2.26 5.93C2.11 5.83 1.95 5.73 1.8 5.63C1.65 5.53 1.5 5.43 1.34 5.33C1.19 5.23 1.03 5.13 0.88 5.03L1.03 5.03C1.03 5.03 1.03 5.03 1.03 5.03L1.03 5.03ZM12.04 3.4C16.73 3.4 20.56 7.23 20.56 11.92C20.56 16.61 16.73 20.44 12.04 20.44C10.45 20.44 8.92 19.95 7.62 19.06L5.3 19.89L6.15 17.58C5.26 16.28 4.77 14.75 4.77 13.16C4.77 8.47 8.6 4.64 13.29 4.64C17.98 4.64 21.81 8.47 21.81 13.16L21.81 13.16ZM15.4 12.87L15.4 12.87L15.4 12.87Z" />
    </svg>
  );

  // Simple SVG for the robot icon in the "About Morox" section
  const RobotAboutSVG = () => (
    <svg viewBox="0 0 200 200" className="w-16 h-16 mx-auto text-blue-500 mb-6">
      <rect x="50" y="50" width="100" height="100" rx="20" ry="20" fill="currentColor"/>
      <circle cx="75" cy="80" r="10" fill="#fff"/>
      <circle cx="125" cy="80" r="10" fill="#fff"/>
      <rect x="70" y="120" width="60" height="10" rx="5" ry="5" fill="#fff"/>
      <rect x="60" y="150" width="10" height="20" rx="5" ry="5" fill="currentColor"/>
      <rect x="130" y="150" width="10" height="20" rx="5" ry="5" fill="currentColor"/>
      <rect x="30" y="80" width="10" height="40" rx="5" ry="5" fill="currentColor"/>
      <rect x="160" y="80" width="10" height="40" rx="5" ry="5" fill="currentColor"/>
    </svg>
  );

  const availableCourses = [
    { icon: <Chalkboard className="w-10 h-10" />, title: "دورة إعداد مدربين", description: "تأهيلك لتصبح مدربًا محترفًا في مهارات الذكاء الاصطناعي." },
    { icon: <GraduationCap className="w-10 h-10" />, title: "مهارات الذكاء الاصطناعي للطلاب", description: "تعليم الطلاب أساسيات الذكاء الاصطناعي وتطبيقاته العملية." },
    { icon: <User className="w-10 h-10" />, title: "مهارات الذكاء الاصطناعي للمدرسين", description: "تمكين المدرسين من استخدام أدوات الذكاء الاصطناعي في العملية التعليمية." },
    { icon: <Baby className="w-10 h-10" />, title: "مهارات الذكاء الاصطناعي للآباء", description: "مساعدة الآباء على فهم الذكاء الاصطناعي لدعم أبنائهم." },
    { icon: <PencilRuler className="w-10 h-10" />, title: "مهارات الذكاء الاصطناعي لصناع المحتوى", description: "كيفية استغلال الذكاء الاصطناعي في إنتاج محتوى إبداعي وجذاب." },
    { icon: <Robot className="w-10 h-10" />, title: "دورة تصميم شخصية افتراضية", description: "تعلم كيفية تصميم وتطوير شخصيات افتراضية بالذكاء الاصطناعي." },
    { icon: <Code className="w-10 h-10" />, title: "مهارات الذكاء الاصطناعي للمبرمجين", description: "تعميق فهم المبرمجين لأدوات وتقنيات الذكاء الاصطناعي المتقدمة." },
    { icon: <Paintbrush className="w-10 h-10" />, title: "مهارات الذكاء الاصطناعي للمصممين", description: "استخدام الذكاء الاصطناعي لتحسين سير عمل التصميم وإنشاء أعمال فنية." },
  ];

  const upcomingCourses = [
    { icon: <GraduationCap className="w-10 h-10" />, title: "دورات تقوية لطلاب الصف التاسع", description: "دورات مكثفة لتقوية مهارات طلاب الصف التاسع." },
    { icon: <User className="w-10 h-10" />, title: "دورات متابعة لطلاب الصف التاسع", description: "متابعة مستمرة ودعم أكاديمي لطلاب الصف التاسع." },
    { icon: <GraduationCap className="w-10 h-10" />, title: "دورات تقوية لطلاب الثالث الثانوي", description: "تحضير شامل لطلاب الثالث الثانوي بجميع الفروع." },
    { icon: <User className="w-10 h-10" />, title: "دورات متابعة لطلاب الثالث الثانوي", description: "متابعة ودعم أكاديمي متخصص لطلاب الثالث الثانوي بجميع الفروع." },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-inter" dir="rtl">
      <header className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white py-12 px-4 shadow-xl">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-right">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-5xl font-extrabold leading-tight mb-4 animate-fade-in-down">
              مرحبًا بك في عالم <span className="text-yellow-300">Morox</span> للذكاء الاصطناعي!
            </h1>
            <p className="text-xl leading-relaxed mb-6">
              نصمم المستقبل معًا من خلال التدريب المبتكر والعملي.
            </p>
            <button
              onClick={() => window.open('https://chat.whatsapp.com/FJnj4j3bMhJ15d7XhUBmgl?mode=ac_t', '_blank')}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition duration-300 flex items-center justify-center mx-auto md:mx-0 w-fit"
            >
              <WhatsappSVG className="ml-3 rtl:mr-3 rtl:ml-0 w-6 h-6" /> {/* Using custom SVG for WhatsApp */}
              انضم إلى مجموعتنا على واتساب
            </button>
          </div>
          <div className="md:w-1/2 flex justify-center items-center">
            {/* Using a simple SVG for the robot for performance and scalability */}
            <svg viewBox="0 0 200 200" className="w-64 h-64 text-blue-200 animate-float">
              <rect x="50" y="50" width="100" height="100" rx="20" ry="20" fill="currentColor"/>
              <circle cx="75" cy="80" r="10" fill="#fff"/>
              <circle cx="125" cy="80" r="10" fill="#fff"/>
              <rect x="70" y="120" width="60" height="10" rx="5" ry="5" fill="#fff"/>
              <rect x="60" y="150" width="10" height="20" rx="5" ry="5" fill="currentColor"/>
              <rect x="130" y="150" width="10" height="20" rx="5" ry="5" fill="currentColor"/>
              <rect x="30" y="80" width="10" height="40" rx="5" ry="5" fill="currentColor"/>
              <rect x="160" y="80" width="10" height="40" rx="5" ry="5" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </header>

      <section className="bg-gray-100 py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-extrabold text-center mb-12 text-gray-800 animate-fade-in-up">
            من نحن؟ <span className="text-blue-600">Morox</span>
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto text-center border border-gray-200">
            <RobotAboutSVG /> {/* Using custom SVG for robot icon */}
            <p className="text-lg leading-relaxed text-gray-700">
              أنا <strong className="text-blue-600">موروكس</strong>، مالك منصات موروكس التدريبية، وأنا مدرب مهارات الذكاء الاصطناعي.
              حلمي أن يوفر الناس جهودهم ويدعون الذكاء الاصطناعي يعمل عنهم ويتعلمون بعض مهاراته.
              أسعى جاهدًا لجعل تعلم الذكاء الاصطناعي ممتعًا وبسيطًا للجميع، بغض النظر عن خلفيتهم أو مستوى خبرتهم.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-extrabold text-center mb-12 text-gray-800 animate-fade-in-up">
            دوراتنا <span className="text-blue-600">المتاحة</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {availableCourses.map((course, index) => (
              <CourseCard key={index} {...course} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-50 py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-extrabold text-center mb-12 text-gray-800 animate-fade-in-up">
            دورات <span className="text-indigo-600">قادمة</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {upcomingCourses.map((course, index) => (
              <CourseCard key={index} {...course} isUpcoming={true} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-center mb-12 text-gray-800 animate-fade-in-up">
            شهادات <span className="text-green-600">الحضور المجانية</span>
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 mb-8">
            بعد إتمامك للدورات، ستحصل على شهادة حضور مجانية تثبت إنجازك وتطورك في مهارات الذكاء الاصطناعي.
            انضم إلينا اليوم وابدأ رحلتك نحو التميز!
          </p>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition duration-300 flex items-center justify-center mx-auto w-fit"
            onClick={() => window.open('https://chat.whatsapp.com/FJnj4j3bMhJ15d7XhUBmgl?mode=ac_t', '_blank')}
          >
            <WhatsappSVG className="ml-3 rtl:mr-3 rtl:ml-0 w-6 h-6" /> {/* Using custom SVG for WhatsApp */}
            سجل الآن عبر واتساب
          </button>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-right">
          <p className="mb-4 md:mb-0 font-inter">&copy; {new Date().getFullYear()} Morox. جميع الحقوق محفوظة.</p>
          <SocialLinks />
        </div>
      </footer>

      {/* Tailwind CSS animations */}
      <style jsx>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-fade-in-down { animation: fadeInDown 1s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

// Login/Register Page Component
const Login = ({ onLoginSuccess, onRegisterSuccess }) => {
  const { auth, db, appId } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
        setSuccessMessage('تم تسجيل الدخول بنجاح!');
        onLoginSuccess();
      } else {
        // Register
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, `/artifacts/${appId}/users/${user.uid}/profile/details`), {
          name,
          phone,
          email,
          uid: user.uid,
          createdAt: new Date(),
        }, { merge: true }); // Use merge to avoid overwriting existing profile data if any

        setSuccessMessage('تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول.');
        onRegisterSuccess();
      }
    } catch (err) {
      setError(err.message.replace('Firebase: Error (auth/', '').replace(').', ''));
      console.error("Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter" dir="rtl">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        <form onSubmit={handleAuth}>
          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  id="name"
                  className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="ادخل اسمك"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="ادخل رقم هاتفك"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required={!isLogin}
                />
              </div>
            </>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="ادخل بريدك الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              كلمة المرور
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (isLogin ? 'جاري تسجيل الدخول...' : 'جاري التسجيل...') : (isLogin ? 'تسجيل الدخول' : 'إنشاء حساب')}
            </button>
          </div>
        </form>
        <p className="text-center text-gray-600 text-sm mt-6">
          {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccessMessage('');
            }}
            className="text-blue-600 hover:text-blue-800 font-bold focus:outline-none"
          >
            {isLogin ? 'إنشاء حساب' : 'تسجيل الدخول'}
          </button>
        </p>
      </div>
    </div>
  );
};

// Admin Login Page Component
const AdminLogin = ({ onAdminLoginSuccess }) => {
  const { auth, appId, db } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminAuth = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the user is in the admins collection
      const adminQuery = query(collection(db, `/artifacts/${appId}/admins`), where('uid', '==', user.uid));
      const adminSnapshot = await getDocs(adminQuery);

      if (!adminSnapshot.empty) {
        onAdminLoginSuccess();
      } else {
        await signOut(auth); // Sign out if not an admin
        setError('ليس لديك صلاحيات المدير.');
      }
    } catch (err) {
      setError(err.message.replace('Firebase: Error (auth/', '').replace(').', ''));
      console.error("Admin Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter" dir="rtl">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">تسجيل دخول المدير</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleAdminAuth}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="admin-email">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="admin-email"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="ادخل بريد المدير الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="admin-password">
              كلمة المرور
            </label>
            <input
              type="password"
              id="admin-password"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول كمدير'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// Student Dashboard Component
const StudentDashboard = () => {
  const { userId, db, appId } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoadingProfile(false);
      setLoadingCourses(false);
      return;
    }

    // Fetch user profile
    const profileDocRef = doc(db, `/artifacts/${appId}/users/${userId}/profile/details`);
    const unsubscribeProfile = onSnapshot(profileDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        console.log("No profile found for user:", userId);
        setProfile(null);
      }
      setLoadingProfile(false);
    }, (error) => {
      console.error("Error fetching profile:", error);
      setLoadingProfile(false);
    });

    // Fetch enrolled courses (example: assuming a subcollection 'enrolledCourses' under user)
    const enrolledCoursesCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/enrolledCourses`);
    const unsubscribeCourses = onSnapshot(enrolledCoursesCollectionRef, (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEnrolledCourses(coursesData);
      setLoadingCourses(false);
    }, (error) => {
      console.error("Error fetching enrolled courses:", error);
      setLoadingCourses(false);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeCourses();
    };
  }, [userId, db, appId]); // Added userId, db, appId to dependencies

  // Using custom SVG for WhatsApp icon due to no direct Lucide equivalent
  const WhatsappSVG = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.04 2C6.58 2 2.12 6.57 2.12 12.04C2.12 14.07 2.72 15.93 3.75 17.52L2.01 22.01L6.6 20.31C8.16 21.23 10.03 21.72 12.04 21.72C17.5 21.72 21.96 17.15 21.96 11.68C21.96 6.22 17.5 2 12.04 2ZM17.18 16.03C16.92 16.51 15.65 17.18 15.4 17.29C15.15 17.41 14.97 17.43 14.65 17.27C14.33 17.12 13.25 16.75 11.97 15.6C10.69 14.45 9.8 13.12 9.54 12.87C9.28 12.61 9.11 12.5 8.94 12.26C8.77 12.03 8.61 11.83 8.44 11.6C8.28 11.37 8.08 10.99 7.93 10.74C7.79 10.51 7.64 10.37 7.5 10.22C7.36 10.08 7.21 9.94 7.07 9.8C6.93 9.66 6.78 9.52 6.64 9.38C6.5 9.24 6.36 9.1 6.22 8.96C6.08 8.82 5.94 8.68 5.8 8.54C5.55 8.28 5.37 8.16 5.15 7.95C4.93 7.74 4.75 7.62 4.6 7.5C4.45 7.37 4.29 7.27 4.13 7.16C3.98 7.05 3.82 6.95 3.66 6.84C3.51 6.74 3.35 6.63 3.19 6.53C3.04 6.43 2.88 6.33 2.72 6.23C2.57 6.13 2.41 6.03 2.26 5.93C2.11 5.83 1.95 5.73 1.8 5.63C1.65 5.53 1.5 5.43 1.34 5.33C1.19 5.23 1.03 5.13 0.88 5.03L1.03 5.03C1.03 5.03 1.03 5.03 1.03 5.03L1.03 5.03ZM12.04 3.4C16.73 3.4 20.56 7.23 20.56 11.92C20.56 16.61 16.73 20.44 12.04 20.44C10.45 20.44 8.92 19.95 7.62 19.06L5.3 19.89L6.15 17.58C5.26 16.28 4.77 14.75 4.77 13.16C4.77 8.47 8.60 4.64 13.29 4.64C17.98 4.64 21.81 8.47 21.81 13.16L21.81 13.16ZM15.4 12.87L15.4 12.87L15.4 12.87Z" />
    </svg>
  );

  if (loadingProfile || loadingCourses) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter" dir="rtl">
        <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-700 text-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span>جاري تحميل لوحة تحكم الطالب...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-inter" dir="rtl">
      <div className="container mx-auto">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center md:text-right">
          أهلاً بك، {profile?.name || 'طالب'}!
        </h2>
        <p className="text-gray-600 mb-6 text-center md:text-right">
            هنا يمكنك رؤية بياناتك والدورات التي التحقت بها.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Profile Card */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 border border-blue-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-between">
              <User className="ml-2 text-blue-500" /> معلوماتي
            </h3>
            {profile ? (
              <>
                <p className="mb-2 text-gray-700"><strong className="text-gray-800">الاسم:</strong> {profile.name}</p>
                <p className="mb-2 text-gray-700"><strong className="text-gray-800">البريد الإلكتروني:</strong> {profile.email}</p>
                <p className="mb-2 text-gray-700"><strong className="text-gray-800">رقم الهاتف:</strong> {profile.phone}</p>
                <p className="text-gray-700"><strong className="text-gray-800">معرف المستخدم:</strong> {userId}</p>
              </>
            ) : (
              <p className="text-gray-600">لا توجد بيانات للملف الشخصي.</p>
            )}
          </div>

          {/* Enrolled Courses */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-green-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-between">
              <GraduationCap className="ml-2 text-green-500" /> الدورات المسجل بها
            </h3>
            {enrolledCourses.length > 0 ? (
              <ul className="space-y-4">
                {enrolledCourses.map(course => (
                  <li key={course.id} className="bg-gray-50 p-4 rounded-lg flex items-center shadow-sm border border-gray-100">
                    <Award className="ml-3 text-yellow-500 w-6 h-6 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-lg text-gray-800">{course.name}</p>
                      <p className="text-sm text-gray-600">
                        {course.description || 'لا يوجد وصف متاح.'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">لم يتم التسجيل في أي دورات بعد.</p>
            )}
          </div>
        </div>

        {/* WhatsApp Link for Community */}
        <div className="bg-gradient-to-r from-green-400 to-teal-500 text-white p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition duration-300">
          <h3 className="text-2xl font-bold mb-4">انضم إلى مجتمع Morox!</h3>
          <p className="text-lg mb-6">
            كن جزءًا من عائلتنا التعليمية وتفاعل مع الطلاب والمدربين.
          </p>
          <button
            onClick={() => window.open('https://chat.whatsapp.com/FJnj4j3bMhJ15d7XhUBmgl?mode=ac_t', '_blank')}
            className="bg-white text-green-700 hover:bg-green-100 font-bold py-3 px-8 rounded-full shadow-md flex items-center justify-center mx-auto w-fit"
          >
            <WhatsappSVG className="ml-3 rtl:mr-3 rtl:ml-0 w-6 h-6" /> {/* Using custom SVG for WhatsApp */}
            مجموعة واتساب Morox
          </button>
        </div>
      </div>
    </div>
  );
};


// Admin Dashboard Component
const AdminDashboard = () => {
  const { db, appId, userId } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ name: '', description: '', type: 'available' });
  const [editingCourse, setEditingCourse] = useState(null); // Course being edited
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [loading, setLoading] = useState(true);

  // Function to show custom modal
  const showModal = (title, message, onConfirm = null) => {
    setModalContent({ title, message, onConfirm });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent({});
  };

  // Fetch courses and users
  useEffect(() => {
    if (!userId) { // Ensure user is authenticated before fetching admin data
        setLoading(false);
        return;
    }

    const fetchCourses = () => {
      const coursesColRef = collection(db, `/artifacts/${appId}/public/data/courses`);
      return onSnapshot(coursesColRef, (snapshot) => {
        const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort courses: available first, then upcoming, then alphabetically by name
        const sortedCourses = coursesData.sort((a, b) => {
            if (a.type === 'available' && b.type !== 'available') return -1;
            if (a.type !== 'available' && b.type === 'available') return 1;
            return a.name.localeCompare(b.name, 'ar');
        });
        setCourses(sortedCourses);
        setLoading(false);
      }, (err) => {
        setError("خطأ في جلب الدورات: " + err.message);
        setLoading(false);
      });
    };

    const fetchUsers = () => {
        // Correctly fetch users from the 'users' collection and then their 'profile/details' subcollection
        const usersColRef = collection(db, `/artifacts/${appId}/users`);
        return onSnapshot(usersColRef, async (snapshot) => {
            const usersData = [];
            // Iterate through each user document (which represents a user ID)
            for (const userDoc of snapshot.docs) {
                // Get the profile details sub-document for this user
                const profileDetailsDocRef = doc(db, `/artifacts/${appId}/users/${userDoc.id}/profile/details`);
                const profileSnap = await getDoc(profileDetailsDocRef); // Use getDoc for a single document

                if (profileSnap.exists()) {
                    usersData.push({ id: userDoc.id, ...profileSnap.data() });
                }
            }
            setUsers(usersData);
        }, (err) => {
            setError("خطأ في جلب المستخدمين: " + err.message);
        });
    };


    const unsubscribeCourses = fetchCourses();
    const unsubscribeUsers = fetchUsers();

    return () => {
        unsubscribeCourses();
        unsubscribeUsers();
    };
  }, [userId, db, appId]); // Added userId, db, appId to dependencies

  // Handle adding/updating course
  const handleSubmitCourse = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!newCourse.name || !newCourse.description) {
      setError('الرجاء إدخال اسم ووصف الدورة.');
      return;
    }

    try {
      if (editingCourse) {
        // Update existing course
        await updateDoc(doc(db, `/artifacts/${appId}/public/data/courses`, editingCourse.id), newCourse);
        setSuccessMessage('تم تحديث الدورة بنجاح!');
        setEditingCourse(null);
      } else {
        // Add new course
        await addDoc(collection(db, `/artifacts/${appId}/public/data/courses`), newCourse);
        setSuccessMessage('تمت إضافة الدورة بنجاح!');
      }
      setNewCourse({ name: '', description: '', type: 'available' }); // Reset form
    } catch (err) {
      setError("خطأ في حفظ الدورة: " + err.message);
      console.error("Error saving course:", err);
    }
  };

  // Set course for editing
  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setNewCourse({ name: course.name, description: course.description, type: course.type });
  };

  // Handle deleting course
  const handleDeleteCourse = (courseId) => {
    showModal(
      'تأكيد الحذف',
      'هل أنت متأكد أنك تريد حذف هذه الدورة؟ لا يمكن التراجع عن هذا الإجراء.',
      async () => {
        closeModal();
        setError('');
        setSuccessMessage('');
        try {
          await deleteDoc(doc(db, `/artifacts/${appId}/public/data/courses`, courseId));
          setSuccessMessage('تم حذف الدورة بنجاح!');
        } catch (err) {
          setError("خطأ في حذف الدورة: " + err.message);
          console.error("Error deleting course:", err);
        }
      }
    );
  };

  // Handle deleting user
  const handleDeleteUser = (uid) => {
    showModal(
      'تأكيد حذف المستخدم',
      `هل أنت متأكد أنك تريد حذف المستخدم ${uid}؟ سيتم حذف جميع بياناته.`,
      async () => {
        closeModal();
        setError('');
        setSuccessMessage('');
        try {
          // Note: Deleting user in Firebase Auth needs Admin SDK, which is not directly available in client-side React.
          // This will only delete the user's profile data in Firestore.
          // For full user deletion (Auth + Firestore), a Cloud Function or server-side logic is typically used.
          await deleteDoc(doc(db, `/artifacts/${appId}/users/${uid}/profile/details`));
          setSuccessMessage(`تم حذف بيانات المستخدم ${uid} بنجاح من Firestore.`);
        } catch (err) {
          setError("خطأ في حذف المستخدم: " + err.message);
          console.error("Error deleting user:", err);
        }
      }
    );
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter" dir="rtl">
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-700 text-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span>جاري تحميل لوحة تحكم المدير...</span>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-inter" dir="rtl">
      <div className="container mx-auto">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center md:text-right">
          لوحة تحكم المدير
        </h2>
        <p className="text-gray-600 mb-6 text-center md:text-right">
            يمكنك هنا إدارة الدورات التدريبية وبيانات المستخدمين.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        {/* Manage Courses Section */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-12 border border-blue-200">
          <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
            <Chalkboard className="ml-2 text-blue-500" /> إدارة الدورات
          </h3>
          <form onSubmit={handleSubmitCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="md:col-span-1">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="course-name">
                اسم الدورة
              </label>
              <input
                type="text"
                id="course-name"
                className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="اسم الدورة"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="course-type">
                نوع الدورة
              </label>
              <select
                id="course-type"
                className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newCourse.type}
                onChange={(e) => setNewCourse({ ...newCourse, type: e.target.value })}
              >
                <option value="available">دورة متاحة</option>
                <option value="upcoming">دورة قادمة</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="course-description">
                وصف الدورة
              </label>
              <textarea
                id="course-description"
                rows="3"
                className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="وصف مختصر للدورة"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                required
              ></textarea>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-2 rtl:space-x-reverse">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors transform hover:scale-105"
              >
                {editingCourse ? 'تحديث الدورة' : 'إضافة دورة جديدة'}
              </button>
              {editingCourse && (
                <button
                  type="button"
                  onClick={() => { setEditingCourse(null); setNewCourse({ name: '', description: '', type: 'available' }); }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-full transition-colors"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>
          </form>

          <h4 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <List className="ml-2 text-blue-500" /> قائمة الدورات
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-200 text-gray-700 text-sm leading-normal">
                  <th className="py-3 px-6 text-right">الاسم</th>
                  <th className="py-3 px-6 text-right">الوصف</th>
                  <th className="py-3 px-6 text-right">النوع</th>
                  <th className="py-3 px-6 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-right whitespace-nowrap">{course.name}</td>
                    <td className="py-3 px-6 text-right">{course.description}</td>
                    <td className="py-3 px-6 text-right">{course.type === 'available' ? 'متاحة' : 'قادمة'}</td>
                    <td className="py-3 px-6 text-center whitespace-nowrap">
                      <div className="flex item-center justify-center space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg text-xs transition-colors"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-xs transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Manage Users Section */}
        <section className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
          <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
            <Users className="ml-2 text-green-500" /> إدارة المستخدمين
          </h3>
          <h4 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <User className="ml-2 text-green-500" /> قائمة الطلاب
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-200 text-gray-700 text-sm leading-normal">
                  <th className="py-3 px-6 text-right">معرف المستخدم (ID)</th>
                  <th className="py-3 px-6 text-right">الاسم</th>
                  <th className="py-3 px-6 text-right">البريد الإلكتروني</th>
                  <th className="py-3 px-6 text-right">رقم الهاتف</th>
                  <th className="py-3 px-6 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-right whitespace-nowrap">{user.id}</td>
                    <td className="py-3 px-6 text-right whitespace-nowrap">{user.name}</td>
                    <td className="py-3 px-6 text-right whitespace-nowrap">{user.email}</td>
                    <td className="py-3 px-6 text-right whitespace-nowrap">{user.phone}</td>
                    <td className="py-3 px-6 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-xs transition-colors"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <CustomModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalContent.title}
        message={modalContent.message}
        onConfirm={modalContent.onConfirm}
      />
    </div>
  );
};

// Main App Component
function App() {
  const { user, isAdmin, loading, auth } = useContext(AuthContext);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'login', 'admin', 'dashboard'

  // Redirect after auth state changes
  useEffect(() => {
    if (!loading) {
      if (user) {
        if (isAdmin) {
          setCurrentView('admin');
        } else {
          setCurrentView('dashboard');
        }
      } else {
        setCurrentView('home');
      }
    }
  }, [user, isAdmin, loading]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentView('home');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navigateTo = (view) => {
    setCurrentView(view);
  };

  // Render content based on currentView
  const renderContent = () => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter" dir="rtl">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-700 text-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span>جاري تحميل التطبيق...</span>
          </div>
        </div>
      );
    }

    if (currentView === 'login') {
      return <Login onLoginSuccess={() => navigateTo(isAdmin ? 'admin' : 'dashboard')} onRegisterSuccess={() => navigateTo('login')} />;
    } else if (currentView === 'admin' && isAdmin) {
      return <AdminDashboard />;
    } else if (currentView === 'dashboard' && user && !isAdmin) {
      return <StudentDashboard />;
    } else if (currentView === 'home' || !user) {
      return <Home onNavigate={navigateTo} />;
    } else {
      // Fallback for unexpected states, e.g., non-admin trying to access admin
      return <Home onNavigate={navigateTo} />;
    }
  };

  return (
    <>
      <Navbar onNavigate={navigateTo} currentView={currentView} user={user} isAdmin={isAdmin} onSignOut={handleSignOut} />
      {renderContent()}
    </>
  );
}

// Wrap App with AuthProvider
export default function ProvidedApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
