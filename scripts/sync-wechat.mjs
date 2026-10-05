import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('../',import.meta.url)));
function run(command,args,input){
 const r=spawnSync(command,args,{input,encoding:'utf8',maxBuffer:8_000_000,timeout:600_000});
 const output=(r.stdout||'')+(r.stderr||'');
 if(output)process.stdout.write(output.replace(/token=[^&\s]+/g,'token=REDACTED'));
 if(r.status!==0)throw new Error(`${command} failed; existing site remains live. ${r.error?.code||''}`);
 return r.stdout;
}
try{
 const status=spawnSync('git',['status','--porcelain'],{encoding:'utf8'});
 if(status.status!==0||status.stdout.trim())throw new Error('工作区有未提交改动，请先处理，未开始同步。');
 run('git',['pull','--ff-only','origin','main']);
 run('ego-browser',['nodejs'],'globalThis.WECHAT_SYNC_PROJECT='+JSON.stringify(process.cwd())+';\n'+readFileSync('scripts/wechat-browser-export.mjs','utf8'));
 run('node',['scripts/import-wechat.mjs']);
 const diff=spawnSync('git',['diff','--quiet','--','public/articles.json']);
 if(diff.status===0){console.log('UNCHANGED');process.exit(0);}
 if(diff.status!==1)throw new Error('Unable to inspect catalog diff');
 run('node',['--test','scripts/test-wechat-sync.mjs']);
 run('npm',['run','build:pages']);
 run('git',['add','--','public/articles.json']);
 run('git',['commit','-m','Sync public WeChat articles']);
 run('git',['push','origin','main']);
 console.log('PUSHED: wait for GitHub Pages deployment before reporting success.');
}catch(error){console.error(error.message);process.exitCode=1;}
