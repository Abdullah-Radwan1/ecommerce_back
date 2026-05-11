import exec from "child_process";
import path from "path";

const restoreBackup = (folderName) => {
  const backupPath = path.join(
    __dirname,
    "..",
    "backups",
    folderName,
    process.env.DB_NAME,
  );
  const DB_URI = process.env.DB_URI;
  const command = `mongostore --uri=${DB_URI} --drop --gzip "${backupPath} `;
};
