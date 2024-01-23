const express=require('express')
const {Client}=require('pg')
const app=express()
const axios=require('axios')
const dotenv=require('dotenv')
dotenv.config()
const client=new Client({
    user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: process.env.password,
  port: 5432,
})

client.connect().then(console.log('db server connected'))

async function fetchdata(){
    try {
        const response=await axios.get('https://api.wazirx.com/api/v2/tickers')
        const top10data=Object.values(response.data).slice(0,10)

        for (const result of top10data) {
            await client.query(
              'INSERT INTO assign(name, last, buy, sell, volume, base_unit) VALUES ($1, $2, $3, $4, $5, $6)',
              [result.name, result.last, result.buy, result.sell, result.volume, result.base_unit]
            )
          }
        
    } catch (error) {
        console.error(error)
    }
}

app.get('/api/getdata',async(req,res)=>{
   try {
    await fetchdata()
    const result=await client.query('SELECT * FROM assign')
    res.json(result.rows)
    client.query('DELETE FROM assign')
   } catch (error) {
    console.error(error)
    res.send('Internal Server error').status(500)
   }
})

app.listen(6000,()=>{
    console.log('server is running')
})