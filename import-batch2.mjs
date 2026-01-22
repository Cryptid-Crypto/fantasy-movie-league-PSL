// Batch 2 Performers Database Import
const batch2Data = [
  {
    name: "Chanel Camryn",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/thnSOndUseHTMVQm.png"
  },
  {
    name: "Cherie DeVille",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/bcAFMpYnzBPQfBmq.png"
  },
  {
    name: "Cherry Kiss",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/oGQSvyTBRoYEhFJH.png"
  },
  {
    name: "Chloe Amour",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/bKpuvzZPPiUCkScn.png"
  },
  {
    name: "Chloe Surreal",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/qlqdXKmHWaaOGATW.png"
  },
  {
    name: "Coco Lovelock",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/YBzDtULXuepXCfTb.png"
  },
  {
    name: "Connie Perignon",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/UYukrzcCzXXEUvyb.png"
  },
  {
    name: "Dani Daniels",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/uCIWuPkbiMVapOjN.png"
  },
  {
    name: "Demi Sutra",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/PhiFLchkgAgxEsHj.png"
  },
  {
    name: "Eliza Ibarra",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/SNHDElqfVqoqWxDD.png"
  },
  {
    name: "Emily Willis",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/lpjrRpHyVdShAqeg.png"
  },
  {
    name: "Emma Hix",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/bGWwNDdPsJkVqHTQ.png"
  },
  {
    name: "Emma Magnolia",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/EJmqvBFJTfgRHLzC.png"
  },
  {
    name: "Eva Elfie",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/iQoqePAUaZLAOkTk.png"
  },
  {
    name: "Gabbie Carter",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/QeWIFxpfKnOSEdYw.png"
  },
  {
    name: "Gal Ritchie",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/ZVyxgwhqTzsCPxvw.png"
  },
  {
    name: "Gianna Dior",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/oazFrQJzEyeYusGX.png"
  },
  {
    name: "Gina Valentina",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/dnLPaQqXzICLDbhS.png"
  },
  {
    name: "Giselle Palmer",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/yaYsIyLiGqVbqYSf.png"
  },
  {
    name: "Gizelle Blanco",
    imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663028198646/vcmAIoABYrkooJSf.png"
  }
];

// Generate SQL INSERT statements
const sqlStatements = batch2Data.map(performer => {
  return `INSERT INTO performers (name, imageUrl, createdAt, updatedAt) VALUES ('${performer.name}', '${performer.imageUrl}', datetime('now'), datetime('now'));`;
}).join('\n');

console.log(sqlStatements);
