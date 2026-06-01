// Redirect naar /lijsten (notities zijn nu onderdeel van Lijsten)
import { redirect } from 'next/navigation'
export default function NotitiesRedirect() { redirect('/lijsten') }
