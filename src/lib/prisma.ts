// Backward-compat re-export — kod tabanı geçiş sürecinde `prisma` adıyla import edilmiş
// Yeni kodda doğrudan `db` kullan: import { db } from "@/db"
export { db as prisma } from "@/db"
