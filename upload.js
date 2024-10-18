import * as path from 'path';
import { exec } from 'child_process';

const localFilePath = 'release/*';
const remoteHost = '124.223.191.107';
const remotePath = '/home/project/loginauth';
const privateKeyPath = path.join(process.env.HOME, '.ssh/id_rsa_pem');
const userName = 'root';
const command = `scp -r -i "${privateKeyPath}" ${localFilePath} ${userName}@${remoteHost}:${remotePath}`;

console.log("开始上传文件到ecs，执行命令：" + command);
exec(command, (err, stdout, stderr) => {
    if (err) {
        console.error('Error uploading file:', err);
        console.error(stderr);
    } else {
        console.log('file uploaded successfully!');
        console.log(stdout);
    }
});

