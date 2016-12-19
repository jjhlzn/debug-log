import { log } from 'util';
const expect = require('chai').expect;
import { LogParser } from '../../scripts/log-parser';

describe("LogParser", () => {
  const logParser = new LogParser({});

  it("should parse log correctly", () => {
    const logstr = `
    2015-03-18 00:04:26,442 [1] DEBUG HDBusiness.BLL.AlipayInfoBLL [(null)] - table.rowcount = 1
    2015-03-18 00:04:26,443 [1] DEBUG HDBusiness.BLL.AlipayInfoBLL [(null)] - table.rowcount = 2
    xxxxxxxxx
    2015-03-18 00:04:26,444 [1] DEBUG HDBusiness.BLL.AlipayInfoBLL [(null)] - table.rowcount = 3
    fsdfsf fdsfsfsf
    2015-03-18 00:04:26,445 [1] DEBUG HDBusiness.BLL.AlipayInfoBLL [(null)] - table.rowcount = 4
    `;

    const logs = logParser._parse(logstr);
    expect(logs.length).to.be.equal(4);
    expect(JSON.stringify(logs[0])).to.be.equal(JSON.stringify({
      time: '2015-03-18 00:04:26,442',
      thread: '1',
      level: 'DEBUG',
      clazz: 'HDBusiness.BLL.AlipayInfoBLL',
      content: 'table.rowcount = 1'
    }));
    expect(JSON.stringify(logs[3])).to.be.equal(JSON.stringify({
      time: '2015-03-18 00:04:26,445',
      thread: '1',
      level: 'DEBUG',
      clazz: 'HDBusiness.BLL.AlipayInfoBLL',
      content: 'table.rowcount = 4'
    }));
  });

  it("should2 ...", () => {
    expect("").to.be.equal("");
  });
});