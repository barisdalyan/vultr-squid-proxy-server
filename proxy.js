import axios from 'axios';
import * as dotenv from 'dotenv';
import fs from 'fs/promises';
import { execFile } from 'child_process';

dotenv.config();

const API_KEY = process.env.VULTR_API_KEY;
const SSH_KEY_ID = process.env.VULTR_SSH_KEY_ID;
const SERVER_REGION = 'ams';
const SERVER_PLAN_ID = 'vc2-1c-1gb';
const SERVER_OS_ID = 1743;

async function createStartupScript(startupScriptPath) {
	try {
		const scriptContent = await fs.readFile(startupScriptPath, { encoding: 'utf8' });
		const encodedScript = Buffer.from(scriptContent, 'utf-8').toString('base64');
		const response = await axios.post(
			'https://api.vultr.com/v2/startup-scripts',
			{
				name: 'docker-install',
				type: 'boot',
				script: encodedScript
			},
			{
				headers: {
					Authorization: `Bearer ${API_KEY}`,
				},
			}
		);
		return response.data.startup_script.id;
	} catch (error) {
		console.error(error);
	}
}

async function createInstance(startupScriptPath) {
	try {
		const startupScriptId = await createStartupScript(startupScriptPath);
		const response = await axios.post(
			'https://api.vultr.com/v2/instances',
			{
				region: SERVER_REGION,
				plan: SERVER_PLAN_ID,
				os_id: SERVER_OS_ID,
				enable_ipv6: false,
				label: 'squid-proxy-server',
				hostname: 'squid-proxy-server',
				sshkey_id: [`${SSH_KEY_ID}`],
				backups: 'disabled',
				activation_email: true,
				ddos_protection: false,
				script_id: startupScriptId
			},
			{
				headers: {
					Authorization: `Bearer ${API_KEY}`,
				},
			}
		);
		console.log(`Instance info:\n${JSON.stringify(response.data)}`);
		return response.data;
	} catch (error) {
		console.error(error);
	}
}

async function getInstanceState(instanceId) {
	try {
		const response = await axios.get(`https://api.vultr.com/v2/instances/${instanceId}`, {
			headers: {
				Authorization: `Bearer ${API_KEY}`,
			},
		});
		return response.data.instance;
	} catch (error) {
		console.error(error);
	}
}

async function waitForInstanceReady(instanceId) {
	try {
		let instanceState = await getInstanceState(instanceId);
		while (instanceState.power_status !== 'running' || instanceState.server_status !== 'ok') {
			console.log('Instance is not ready yet. Waiting 10 seconds...');
			await new Promise(resolve => setTimeout(resolve, 10000));
			instanceState = await getInstanceState(instanceId);
		}
		console.log(`Instance (${instanceState.main_ip}) is ready for SSH connection!`);
		return instanceState.main_ip;
	} catch (error) {
		console.error(error);
	}
}

async function executeDeploymentScript(deployScriptPath, mainIp) {
	try {
		const args = [mainIp];
		const child = execFile(deployScriptPath, args, (error, stdout, stderr) => {
			if (error) {
				console.error(`Error executing the script: ${error}`);
				return;
			}
			console.log('Message: squid-proxy-server deployed to /root/ directory.');
		});
		child.on('close', (code) => {
			console.log(`Script exited with code: ${code}`);
		});
	} catch (error) {
		console.error(error);
	}
}

async function createServer(startupScriptPath, deployScriptPath) {
	try {
		const instance = await createInstance(startupScriptPath);
		const mainIp = await waitForInstanceReady(instance.instance.id);
		await executeDeploymentScript(deployScriptPath, mainIp);
	} catch (error) {
		console.error(error);
	}
}

await createServer('./docker_startup.sh', './deploy_docker_squid.sh');