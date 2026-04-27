import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/upload" element={<div>Upload</div>} />
          <Route path="/transactions" element={<div>Transactions</div>} />
          <Route path="/budget" element={<div>Budget</div>} />
          <Route path="/insights" element={<div>Insights</div>} />
          <Route path="/login" element={<div>Login</div>} />
          <Route path="/signup" element={<div>Sign Up</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
