import { auth, db } from '../config/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export const debugSubscriptionIssue = async () => {
  console.log('=== SUBSCRIPTION DEBUG ===')
  
  // Check current user
  const currentUser = auth.currentUser
  console.log('Current user:', currentUser)
  console.log('User UID:', currentUser?.uid)
  console.log('User email:', currentUser?.email)
  console.log('User verified:', currentUser?.emailVerified)
  
  if (!currentUser) {
    console.error('No user is currently logged in')
    return
  }
  
  try {
    // Check if subscription document exists
    const subscriptionRef = doc(db, 'subscriptions', currentUser.uid)
    const subscriptionDoc = await getDoc(subscriptionRef)
    
    console.log('Subscription document exists:', subscriptionDoc.exists())
    
    if (subscriptionDoc.exists()) {
      console.log('Subscription data:', subscriptionDoc.data())
    } else {
      console.log('Creating default subscription document...')
      
      const defaultSubscription = {
        plan: 'free',
        status: 'active',
        startDate: new Date(),
        endDate: null,
        trialEndDate: null,
        isTrialActive: false,
        paymentMethod: null,
        lastPayment: null,
        nextBilling: null,
        usage: {
          boards: 0,
          members: 0,
          storage: 0
        },
        createdAt: new Date(),
        createdBy: currentUser.uid
      }
      
      await setDoc(subscriptionRef, defaultSubscription)
      console.log('Default subscription created successfully')
    }
    
    // Test write permissions
    console.log('Testing write permissions...')
    const testUpdate = {
      lastChecked: new Date(),
      debugTest: true
    }
    
    await setDoc(subscriptionRef, testUpdate, { merge: true })
    console.log('Write test successful')
    
  } catch (error) {
    console.error('Error in subscription debug:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    
    if (error.code === 'permission-denied') {
      console.error('PERMISSION DENIED: Check Firebase security rules')
    }
    
    if (error.code === 'not-found') {
      console.error('DOCUMENT NOT FOUND: Will try to create it')
    }
  }
  
  console.log('=== END DEBUG ===')
}

// Call this function from browser console to debug
window.debugSubscription = debugSubscriptionIssue
