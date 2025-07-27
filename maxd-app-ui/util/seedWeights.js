// seedWeights2024.ts

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMTkxNWI3Zi04YmU4LTRiZjktOTY4YS00NzgxY2VkNDBjNzkiLCJpYXQiOjE3NTM1MDMxMjB9.iHu6q-41RF_b1XLHUXdojs_dRP-eCxU9Z6o0-euodd4'

if (!token) {
  console.error('❌ TOKEN missing. Set TOKEN env variable.')
  process.exit(1)
}

async function seedWeights2024() {
  const start = new Date('2024-01-01')
  const end = new Date('2024-12-31')

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const date = d.toISOString().split('T')[0]
    const weightInKg = Math.floor(Math.random() * 10) + 70 // 70–79 kg

    try {
      const res = await fetch(`http://192.168.0.6:3001/weights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: weightInKg, date }),
      })

      const data = await res.json()

      if (res.status === 409) {
        console.log(`⚠️ Skipped ${date}: already logged`)
        continue
      }

      if (!res.ok) {
        console.error(`❌ Failed for ${date}: ${data?.error || 'Unknown error'}`)
        continue
      }

      console.log(`✅ Logged ${weightInKg}kg for ${date}`)
    } catch (err) {
      console.error(`❌ Exception for ${date}:`, err.message)
    }
  }
}

seedWeights2024()
