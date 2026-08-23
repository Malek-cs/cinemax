// interface GazaData {
//   killed: { total: number; children: number; women: number };
//   injured: { total: number };
// }

// async function fetchGazaData(): Promise<GazaData | null> {
//   try {
//     const res = await fetch(
//       'https://data.techforpalestine.org/api/v2/summary.json',
//       { next: { revalidate: 3600 } }
//     );
//     if (!res.ok) return null;
//     return res.json();
//   } catch {
//     return null;
//   }
// }

// export default async function GazaBanner() {
//   const data = await fetchGazaData();

//   return (
//     <div className="w-full bg-[#0d0d0d] border-b-2 border-[#e63946]">
//       {/* Top strip — red */}
//       <div className="bg-[#e63946] py-1.5 px-4 text-center">
//         <p className="text-white font-black text-xs sm:text-sm tracking-widest uppercase">
//           🇵🇸 &nbsp; Free Palestine &nbsp; — &nbsp; شهداء غزة ليسوا أرقاماً &nbsp; 🇵🇸
//         </p>
//       </div>

//       {/* Stats row */}
//       {data && (
//         <div className="py-3 px-4">
//           <div className="max-w-screen-xl mx-auto grid grid-cols-3 gap-2 sm:gap-6 text-center">

//             {/* Martyrs */}
//             <div className="flex flex-col items-center gap-0.5">
//               <span className="text-[#e63946] text-xl sm:text-3xl font-black leading-none">
//                 {data.killed.total.toLocaleString()}+
//               </span>
//               <span className="text-gray-300 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
//                 شهيد
//               </span>
//               <span className="text-gray-600 text-[9px] sm:text-[10px]">Martyred</span>
//             </div>

//             {/* Children */}
//             <div className="flex flex-col items-center gap-0.5 border-x border-white/10">
//               <span className="text-orange-400 text-xl sm:text-3xl font-black leading-none">
//                 {data.killed.children.toLocaleString()}+
//               </span>
//               <span className="text-gray-300 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
//                 طفل شهيد
//               </span>
//               <span className="text-gray-600 text-[9px] sm:text-[10px]">Children</span>
//             </div>

//             {/* Injured */}
//             <div className="flex flex-col items-center gap-0.5">
//               <span className="text-yellow-400 text-xl sm:text-3xl font-black leading-none">
//                 {data.injured.total.toLocaleString()}+
//               </span>
//               <span className="text-gray-300 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
//                 جريح
//               </span>
//               <span className="text-gray-600 text-[9px] sm:text-[10px]">Injured</span>
//             </div>
//           </div>

//           <p className="text-center text-gray-500 text-[10px] sm:text-xs mt-2.5 font-medium">
//             كل رقم كان إنساناً — له اسم، وحلم، وعائلة تنتظره
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }
