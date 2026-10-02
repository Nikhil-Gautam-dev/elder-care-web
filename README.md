# ElderCare
## Nobi: You speak. Nobi clicks.
## Inspiration
The world is rapidly digitizing, but our aging population is being left behind. In India and across the globe, essential services—from ordering daily groceries on Swiggy Instamart, to booking an Uber, to paying electricity bills, to refilling prescriptions on Apollo Pharmacy—require navigating complex apps, OTPs, and ever-changing user interfaces.

For the elderly, or those with declining motor skills and vision, a smartphone isn't a tool of convenience; it’s a barrier. Meanwhile, their adult children (the "Sandwich Generation") are burnt out acting as permanent remote tech support.

We realized that making interfaces simpler isn't the solution. Removing the interface entirely is. We were inspired to build Nobi: an ambient, voice-first digital proxy that doesn't just tell our grandparents how to use the internet, but actively uses the internet for them.

## What it does
Nobi turns a standard Amazon Echo or smartphone into an autonomous digital caretaker.

The Patient Listener: A user simply says, "Alexa, tell Nobi my stomach hurts, I need my usual medicine, and book a cab to Dr. Sharma for tomorrow at 10 AM."
The Vision Bridge: If the user is confused by a piece of mail or an empty pill bottle, they hold it up to the Echo Show camera or companion app. Nobi reads the blurry physical label to understand exactly what needs to be refilled.
The Autonomous Action: Instead of just giving verbal advice, Nobi acts. It opens a virtual browser in the cloud, navigates to the pharmacy and ride-hailing websites, logs in, clicks the necessary buttons, and confirms the orders.
The Family Loop: Nobi automatically WhatsApps or texts the user's adult child: "Update: I just booked Dad an Uber to the clinic for tomorrow and ordered his medicine."
## How we built it
To achieve this level of autonomy, we leveraged the full spectrum of the Amazon Nova portfolio on AWS, transitioning from a traditional text-in/text-out chatbot to a multi-modal, agentic action-engine.

The Interface & Voice (Alexa Skills Kit & Nova 2 Sonic): We built Nobi as an Alexa Custom Skill. The voice interactions are powered by Nova 2 Sonic, which provides ultra-low latency, empathetic, and human-like conversational speech—crucial for making elderly users feel comfortable and heard.
The Brain (Nova 2 Lite & Amazon Bedrock): Nova 2 Lite acts as the agentic orchestrator. It extracts intents from the conversational transcript, handles the logic (e.g., checking the time, retrieving stored home addresses), and routes the task to the correct agent.
The Eyes (Nova Multimodal Embeddings): When a user uploads a photo of a physical bill or prescription bottle, we use Nova's state-of-the-art multimodal capabilities to extract the text, context, and required action items.
The Hands (Nova Act): This is the crown jewel of our technical implementation. Once Nova 2 Lite decides on an action, it triggers Nova Act. Running on AWS Lambda and interacting with a headless browser, Nova Act takes over the UI automation—navigating real-world web applications, filling out checkout forms, handling basic pop-ups, and clicking "Confirm Order" without human intervention.
## Challenges we ran into
The Unpredictability of UI Automation: Real-world websites are messy. Promotional pop-ups, slight UI layout changes, and dynamic loading times constantly threatened to break our automation scripts. Using Nova Act's intelligent, vision-based UI workflow automation allowed our agents to adapt to visual cues (like finding the "Cart" icon even if it moved) rather than relying on brittle HTML DOM paths.
Latency vs. User Experience: Stringing together voice recognition, LLM reasoning, and headless browser automation takes time. We couldn't leave the elderly user waiting in silence for 45 seconds. We solved this by implementing asynchronous processing. Nobi uses Nova 2 Sonic to immediately reply: "I'm on it! I'll take care of booking that cab and let your son know when it's confirmed," while Nova Act does the heavy lifting in the background.
## Accomplishments that we're proud of
True Zero-UI Navigation: We successfully proved that a user can complete a complex, multi-step e-commerce checkout without ever looking at a screen or typing on a keyboard.
Full Nova Ecosystem Integration: We didn't just use one model. We successfully pipelined Voice (Sonic), Vision (Multimodal), Reasoning (Lite), and Action (Act) into a single, cohesive AWS architecture.
Bridging the Digital Divide: We built a product that restores dignity and independence to a vulnerable community while providing immense peace of mind to their families.
## What we learned
We learned that the era of the "chatbot" is over; the era of the "do-bot" is here. Foundation models are incredible at reasoning, but their true business and community value is unlocked when you give them the "hands" to execute tasks in the real world. Nova Act completely changed our perspective on what is possible with AI-driven accessibility.

## What's next for Nobi
Nobi is primed for a massive B2C commercial rollout.

B2C SaaS Monetization: We plan to launch Nobi as a $14.99/month subscription service marketed to the "Sandwich Generation" (adults caring for aging parents). It’s cheaper than a home aide and infinitely more capable than standard smart home routines.
Deep Integrations & Affiliates: We plan to move beyond standard web automation by integrating directly with APIs of major Indian platforms (Blinkit, PharmEasy, Zepto, Ola/Uber) to create faster, more resilient booking pipelines, eventually earning affiliate revenue on every order Nobi places.
Proactive Health Monitoring: Integrating Nobi with smart wearables (like Apple Watch or Fitbit) so Nobi can proactively ask, "I noticed your heart rate was high last night, would you like me to schedule a telehealth call with Dr. Sharma?"
## Built With
nova
