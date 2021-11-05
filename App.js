import React, { useState, useEffect } from 'react'
import 'antd/dist/antd.css';
import { ethers } from "ethers";
import "./App.css";
import { Row, Col, Input, Button, Spin } from 'antd';
import { Transactor } from "./helpers"
import { useExchangePrice, useGasPrice, useContractLoader, useContractReader } from "./hooks"
import { Header, Account, Provider, Faucet, Ramp, Address, Contract } from "./components"
import { jsPDF } from "jspdf";
import { CID } from 'multiformats/cid'

const { TextArea } = Input;
const { BufferList } = require('bl')

const doc = new jsPDF({
  orientation: "landscape",
  unit: "in",
  format: [7, 2]
});

const dc = new jsPDF({
  orientation: "landscape",
  unit: "in",
  format: [7, 2]
});


const ipfsAPI = require('ipfs-http-client');
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https' })

const getFromIPFS = async hashToGet => {
  for await (const file of ipfs.get(hashToGet)) {
    console.log(file.path)
    if (!file.content) continue;
    const content = new BufferList()
    for await (const chunk of file.content) {
      content.append(chunk)
    }
    console.log(content)
    return content
  }
}

const addToIPFS = async fileToUpload => {
  for await (const result of ipfs.add(fileToUpload)) {
    return result
  }
}

const mainnetProvider = new ethers.providers.InfuraProvider("mainnet","2717afb6bf164045b5d5468031b93f87")
const localProvider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_PROVIDER?process.env.REACT_APP_PROVIDER:"http://localhost:8545")

function App() {

  const [address, setAddress] = useState();
  const [injectedProvider, setInjectedProvider] = useState();
  const price = useExchangePrice(mainnetProvider)
  const gasPrice = useGasPrice("fast")

  const tx = Transactor(injectedProvider,gasPrice)

  const readContracts = useContractLoader(localProvider);
  const writeContracts = useContractLoader(injectedProvider);

  const myAttestation = useContractReader(readContracts,"Attestor","attestations",[address],1777);

  // const [ data, setData ] = useState()
  var data, res;
  const [ name, setName ] = useState()
  const [ sname, setSName ] = useState()
  const [ dob, setDOB ] = useState()
  const [ gen, setGen ] = useState()
  const [ cit, setCit ] = useState()
  const [ dl, setDL ] = useState()
  const [ sending, setSending ] = useState()
  const [ loading, setLoading ] = useState()
  const [ ipfsHash, setIpfsHash ] = useState()
  const [ ipfsContents, setIpfsContents ] = useState()
  const [ attestationContents, setAttestationContents ] = useState()
  
  const [yourname, setYourname] = useState('');
  const [yousname, setYoursname] = useState('');
  const [ydob, setYourdob] = useState('');
  const [ygen, setYourgen] = useState('');
  const [ycit, setYourcit] = useState('');
  const [ydl, setYourdl] = useState('');

  const asyncGetFile = async ()=>{
    let result = await getFromIPFS(ipfsHash)
    res = result
    setIpfsContents(result.toString())
    // console.log(res._bufs[0])
   //yourname = res.slice(5,res.indexOf(10)+1).toString()
    
    // yousname = res.slice(res.indexOf(58)+1,res.indexOf(10)+1).toString()
    var col = 0
    for(var i=0;i<res.length;i++){
        
        
      if(res._bufs[0][i]==58){
        // console.log(res._bufs[0][i])
        // console.log(col)
        if(col==0){
          
          setYourname(res.slice(i+1,res.indexOf(10)).toString())
          console.log(yourname)
          col=col+1
        }
        else if (col==1){
  
          setYoursname(res.slice(i+1,res.indexOf(10,i)).toString())
          console.log(yousname)
          col=col+1
        }
        else if (col==2){
          setYourdob(res.slice(i+1,res.indexOf(10,i)).toString())
          console.log(ydob)
          col=col+1
        }
        else if(col==3){
          setYourgen(res.slice(i+1,res.indexOf(10,i)).toString())
          console.log(ygen)
          col=col+1
        }
        else if(col==4){
          setYourcit(res.slice(i+1,res.indexOf(10,i)).toString())
          console.log(ycit)
          col=col+1
        }
        else{
          setYourdl(res.slice(i+1,res.length).toString())
          console.log(ydl)
        }
        
      }
  
    }

  }



  useEffect(()=>{
    if(ipfsHash) asyncGetFile()
  },[ipfsHash])

  let ipfsDisplay = ""
  if(ipfsHash){
    if(!ipfsContents){
      ipfsDisplay = (
        <Spin />
      )
    }else{
      ipfsDisplay = (
        <pre style={{margin:8,padding:8,border:"1px solid #dddddd",backgroundColor:"#ededed"}}>
          {ipfsContents}
        </pre>
      )
    }
  }



  const asyncGetAttestation = async ()=>{
    let result = await getFromIPFS(myAttestation)
    setAttestationContents(result.toString())
  }

  useEffect(()=>{
    if(myAttestation) asyncGetAttestation()
  },[myAttestation])


  let attestationDisplay = ""
  if(myAttestation){
    if(!attestationContents){
      attestationDisplay = (
        <Spin />
      )
    }else{
      attestationDisplay = (
        <div>
          <Address value={address} /> attests to:
          <pre style={{margin:8,padding:8,border:"1px solid #dddddd",backgroundColor:"#ededed"}}>
            {attestationContents}
          </pre>
        </div>

      )
    }
  }

  return (
    <div className="App">
      <Header />
      <div style={{position:'fixed',textAlign:'right',right:0,top:0,padding:10}}>
        <Account
          address={address}
          setAddress={setAddress}
          localProvider={localProvider}
          injectedProvider={injectedProvider}
          setInjectedProvider={setInjectedProvider}
          mainnetProvider={mainnetProvider}
          price={price}
        />
      </div>

      <div style={{padding:32,textAlign: "left"}}>
        <div>
          <label>Name:</label>
        </div>
        <TextArea rows={1} value={name} onChange={(e)=>{
          setName(e.target.value)
        }} />
        <div>
          <label>Surname:</label>
        </div>
       
        <TextArea rows={1} value={sname} onChange={(e)=>{
          setSName(e.target.value)
        }} />
                <div>
          <label>Date of Birth:</label>
        </div>
        <TextArea rows={1} value={dob} onChange={(e)=>{
          setDOB(e.target.value)
        }} />
        <div>
          <label>Gender:</label>
        </div>
        
        <TextArea rows={1} value={gen} onChange={(e)=>{
          setGen(e.target.value)
        }} />
        <div>
          <label>Country of Birth:</label>
        </div>
        
        <TextArea rows={1} value={cit} onChange={(e)=>{
          setCit(e.target.value)
        }} />
        <div>
          <label>Driver's License:</label>
        </div>
        
        <TextArea rows={1} value={dl} onChange={(e)=>{
          setDL(e.target.value)
        }} />
        <Button style={{margin:8}} loading={sending} size="large" shape="round" type="primary" onClick={async()=>{
          console.log("UPLOADING...")
          setSending(true)
          setIpfsHash()
          setIpfsContents()
          data = "Name:"+name+"\nSurname:"+sname+"\nDate of Birth:"+dob+"\nGender:"+gen+"\nContry of Birth:"+cit+"\nDriver's License:"+dl;
          const result = await addToIPFS(data)

          if(result && result.path) {
            setIpfsHash(result.path)
          }

          setSending(false)
          console.log("RESULT:",result)
        }}>Upload to IPFS</Button>
      </div>

      <div style={{padding:32,textAlign: "left"}}>
        IPFS Hash: <Input value={ipfsHash} onChange={(e)=>{
          setIpfsHash(e.target.value)
        }} />
        {ipfsDisplay}

        <Button disabled={!ipfsHash} style={{margin:8}} size="large" shape="round" type="primary" onClick={async()=>{
          tx( writeContracts["Attestor"].attest(ipfsHash) )
        }}>Attest to this hash on Ethereum</Button>
      </div>

<div>
      <Button disabled={!ipfsHash} style={{margin:8}} size="large" shape="round" type="primary" onClick={async()=>{
          // alert(" " + yourname+" "+yousname+"\nDriver's License status: "+ydl)
          //const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          const d = new Date();
          doc.text(yourname+" "+yousname+"\nDriver's License status: "+ydl+"\nVerification Date: "+d.getDate()+"/"+d.getMonth()+"/"+d.getFullYear(),0.25,0.5);
          doc.save(ipfsHash+'_License.pdf');
        }}>Traffic Officer</Button>

      <Button disabled={!ipfsHash} style={{margin:8}} size="large" shape="round" type="primary" onClick={async()=>{
          // alert("The hash " + ipfsHash+" belongs to "+yourname+" "+yousname)
          const d = new Date();
  
          dc.text("The hash:\n" + ipfsHash+"\nBelongs to: "+yourname+" "+yousname+"\nBorn in: "+ydob+"\nVerification Date: "+d.getDate()+"/"+d.getMonth()+"/"+d.getFullYear(),0.25,0.5);
          dc.save(ipfsHash+'_ID.pdf');
        }}>Identity Verfication</Button>

   
        {/* <Button disabled={ipfsHash} style={{margin:8}} size="large" shape="round" type="primary" onClick={async()=>{
            const hashes = ['QmaFAqyF447sz38HxwpKHXYHTKfUNxZd5LcXsgKzSqvmX5','QmZaEX3YDmqSgX85RtNAeyTr2jchEjuYkGN6FR68XubYkF','QmVFJMSLpnHb143ktJsSzJPd4PdQqyknK8C2hgqrAHghDu','QmQ8rJMNQWMJAKF9B8kceqVc32vVieGb2ct5Hzxz4gsFjZ','Qme4eD9oaoMKqkosqQQyCXDdspiiXdkwpQnNZ8Xu3HKAVw','QmaCAimukhdPSod4dNZidQoXTu6D1UBjkLXuiLwpQnWkmC','QmXvEqVqdNMAzWmSd1SE6VmRnJLUkXKtbwn8B76QH6WaMW','QmeVKwboJdo62JXUfppDiAYeXB6HJbw97xcxbMdXAse5G5','QmZudnnEmH1ACpNEh5NZm6eHzSv1Rasw3VeWFzNW5ivoDQ','QmWWbse5wtE7fGwRFKGsGsAAAD1jFgPHAGFVM8VDHe5Hyy']
            var cid
            
            for(var j = 0;j<10;j++){
              
              const stats = await ipfs.object.stat(hashes[j])
              console.log(stats)

            }

            // const multihashStr = 'QmQULBtTjNcMwMr4VMNknnVv3RpytrLSdgpvMcTnfNhrBJ'
            // const cid = CID.parse(multihashStr)
            
            // const multihash = 'QmaFAqyF447sz38HxwpKHXYHTKfUNxZd5LcXsgKzSqvmX5'

            // const stats = await ipfs.object.stat(multihash)
            // console.log(stats)
            // console.log(stats.cid.toString())
            // console.log(stats.size)

        }}>Stats</Button> */}




</div>

{/* {
      <div style={{padding:32,textAlign: "left"}}>
        Name: 
        {ipfsName}

        <Button disabled={!ipfsHash} style={{margin:8}} size="large" shape="round" type="primary" onClick={async()=>{
          tx( writeContracts["Attestor"].attest(ipfsHash) )
        }}>Extract Name</Button>
      </div> } */}


      <div style={{padding:32,textAlign: "left"}}>
        {attestationDisplay}
      </div>

      {/*<div style={{padding:64,textAlign: "left"}}>
        <Contract
          name={"Attestor"}
          provider={injectedProvider}
          address={address}
        />
      </div>*/}

      <div style={{position:'fixed',textAlign:'right',right:0,bottom:20,padding:10}}>
        <Row align="middle" gutter={4}>
          <Col span={10}>
            <Provider name={"mainnet"} provider={mainnetProvider} />
          </Col>
          <Col span={6}>
            <Provider name={"local"} provider={localProvider} />
          </Col>
          <Col span={8}>
            <Provider name={"injected"} provider={injectedProvider} />
          </Col>
        </Row>
      </div>
      <div style={{position:'fixed',textAlign:'left',left:0,bottom:20,padding:10}}>
        <Row align="middle" gutter={4}>
          <Col span={9}>
            <Ramp
              price={price}
              address={address}
            />
          </Col>
          <Col span={15}>
            <Faucet
              localProvider={localProvider}
              price={price}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default App;
