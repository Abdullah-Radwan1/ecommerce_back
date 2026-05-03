import exec from "child_process";
import path from "path";
import fs from "fs";

const createBackup = () => {
  const timeStamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFolder = path.join(__dirname, "backups", `backup${timeStamp}`);
  if (!fs.existsSync(backupFolder)) {
    fs.mkdirSync(backupFolder, { recursive: true });
  }

  const DB_URI = process.env.DB_URI;
  const command = `mongodump --uri=${DB_URI} --out="${backupFolder}" --gzip`;

  exec(command, (error, stout, sterr) => {
    if (error) {
      console.log(error);
    } else {
      ("backup completed");
    }
  });
};
