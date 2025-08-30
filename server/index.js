import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { analyzeQuery } from './api.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

const app = express()
const PORT = 3001

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))

app.post('/api/analyze', analyzeQuery)

app.listen(PORT, () => {
  console.log(`AI分析サーバーが起動しました: http://localhost:${PORT}`)
})