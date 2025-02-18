import { useState } from "react"

export default function CreateAdminAccountTab() {
  const [username, setUsername] = useState("")
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState({ type: "", content: "" })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage({ type: "error", content: "Passwords do not match" })
      return
    }
    // Here you would typically make an API call to create the account
    console.log("Admin account created", { username, id, password })
    setMessage({ type: "success", content: "Admin account created successfully" })
    // Reset form
    setUsername("")
    setId("")
    setPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Create Admin Account</h3>
      {message.content && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertTitle>{message.type === "error" ? "Error" : "Success"}</AlertTitle>
          <AlertDescription>{message.content}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="id">ID</Label>
          <Input id="id" value={id} onChange={(e) => setId(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button type="submit">Create Account</Button>
      </form>
    </div>
  )
}
