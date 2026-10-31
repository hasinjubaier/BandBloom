-- =============================================================================
-- BandBloom IELTS SaaS - Listening Module Question Types, Media & Seeds Migration
-- Migration 009: 4-Part Structure, Physical Media Assets, Database Transcripts & Playback States
-- =============================================================================

-- 1. Create Audio Transcripts Table (Phase 5)
CREATE TABLE IF NOT EXISTS audio_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    part_number INT NOT NULL,
    title TEXT NOT NULL,
    context TEXT NOT NULL,
    speakers TEXT NOT NULL,
    full_transcript TEXT NOT NULL,
    segments_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    content_version TEXT NOT NULL DEFAULT '2026.1',
    verification_status TEXT NOT NULL DEFAULT 'verified',
    is_synthetic BOOLEAN NOT NULL DEFAULT true,
    voice_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_audio_transcripts_part UNIQUE (media_asset_id, part_number)
);

-- 2. Create Attempt Playback States Table (Phase 7: Server-Authoritative Single-Play Rule)
CREATE TABLE IF NOT EXISTS attempt_playback_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    section_id UUID REFERENCES exam_sections(id) ON DELETE CASCADE,
    part_number INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'not_started',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    play_count INT NOT NULL DEFAULT 0,
    client_playback_mode TEXT NOT NULL DEFAULT 'simulation',
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_attempt_part_playback UNIQUE (attempt_id, part_number)
);

-- 3. Insert or Update Verified Media Assets (Phase 2: Physical Audio Files on Disk)
INSERT INTO media_assets (
    id, object_key, mime_type, transcript_ref, license_status, file_size_bytes, duration_seconds, metadata
)
VALUES
    (
        'aaaa1111-1111-1111-1111-111111111111',
        'audio/listening/part1_tenancy_dialogue.wav',
        'audio/wav',
        'Part 1: Student Accommodation & Tenancy Agreement',
        'owned',
        7021496,
        159,
        '{"part":1,"is_synthetic":true,"accent":"British English & International English (BandBloom Calibrated)","wpm":150,"tts_provider":"BandBloom Calibrated Speech Synthesizer","voice_name":"Microsoft David Desktop","voice_language":"en-US","voice_provenance":"Original BandBloom Synthetic Practice Audio","sha256":"88d1339dfd73a29793d279e26fb927a8df3ab7067325a4960198261b484d7d1e","storage_status":"published_local","content_version":"2026.1"}'::jsonb
    ),
    (
        'aaaa1111-1111-1111-1111-111111111112',
        'audio/listening/part2_sports_centre.wav',
        'audio/wav',
        'Part 2: Riverside Sports Centre Orientation & Facilities Tour',
        'owned',
        6974684,
        158,
        '{"part":2,"is_synthetic":true,"accent":"Australian English (BandBloom Calibrated)","wpm":142,"tts_provider":"BandBloom Calibrated Speech Synthesizer","voice_name":"Microsoft David Desktop","voice_language":"en-US","voice_provenance":"Original BandBloom Synthetic Practice Audio","sha256":"bac16e3a67ae25841a470796abdbde4c2e865025d1b9c11239df3933ccca3824","storage_status":"published_local","content_version":"2026.1"}'::jsonb
    ),
    (
        'aaaa1111-1111-1111-1111-111111111113',
        'audio/listening/part3_wind_turbine.wav',
        'audio/wav',
        'Part 3: Renewable Energy Tutorial — Offshore Wind Turbine Design',
        'owned',
        7778292,
        176,
        '{"part":3,"is_synthetic":true,"accent":"Scottish / British & Academic English (BandBloom Calibrated)","wpm":155,"tts_provider":"BandBloom Calibrated Speech Synthesizer","voice_name":"Microsoft David Desktop","voice_language":"en-US","voice_provenance":"Original BandBloom Synthetic Practice Audio","sha256":"0e43a9da30f17e56b9d99d4b3a4853fc6e138051fa9a9e4c56eeaffc0280d4f4","storage_status":"published_local","content_version":"2026.1"}'::jsonb
    ),
    (
        'aaaa1111-1111-1111-1111-111111111114',
        'audio/listening/part4_marine_bioacoustics.wav',
        'audio/wav',
        'Part 4: Marine Bioacoustics and Ocean Anthropogenic Noise',
        'owned',
        8007934,
        182,
        '{"part":4,"is_synthetic":true,"accent":"RP British English Academic Lecture (BandBloom Calibrated)","wpm":138,"tts_provider":"BandBloom Calibrated Speech Synthesizer","voice_name":"Microsoft David Desktop","voice_language":"en-US","voice_provenance":"Original BandBloom Synthetic Practice Audio","sha256":"d9aadbc24aaecddb4c3e1d8749c95af0d97fa48ecc4e57021fcca85a845d39a2","storage_status":"published_local","content_version":"2026.1"}'::jsonb
    )
ON CONFLICT (id) DO UPDATE SET
    object_key = EXCLUDED.object_key,
    mime_type = EXCLUDED.mime_type,
    transcript_ref = EXCLUDED.transcript_ref,
    license_status = EXCLUDED.license_status,
    file_size_bytes = EXCLUDED.file_size_bytes,
    duration_seconds = EXCLUDED.duration_seconds,
    metadata = EXCLUDED.metadata;

-- 4. Clean up legacy single-section structure on exam 22222222-2222-2222-2222-222222222222
DELETE FROM exam_section_questions WHERE exam_section_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3';
DELETE FROM exam_sections WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3';

-- 5. Insert 4 Distinct Listening Exam Sections (Phase 1: 4 Parts, 10 Questions each)
INSERT INTO exam_sections (id, exam_id, skill, duration_seconds, order_index, instructions, config)
VALUES
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11',
        '22222222-2222-2222-2222-222222222222',
        'listening',
        450,
        1,
        'Part 1: Social Context Dialogue (Tenancy Registration). 10 questions with Original BandBloom Calibrated Audio.',
        '{"part_number": 1, "media_asset_id": "aaaa1111-1111-1111-1111-111111111111"}'::jsonb
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12',
        '22222222-2222-2222-2222-222222222222',
        'listening',
        450,
        2,
        'Part 2: Social Context Monologue (Riverside Sports Centre Facility Tour). 10 questions with Original BandBloom Calibrated Audio.',
        '{"part_number": 2, "media_asset_id": "aaaa1111-1111-1111-1111-111111111112"}'::jsonb
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb13',
        '22222222-2222-2222-2222-222222222222',
        'listening',
        450,
        3,
        'Part 3: Educational / Training Discussion (Offshore Wind Turbine Design). 10 questions with Original BandBloom Calibrated Audio.',
        '{"part_number": 3, "media_asset_id": "aaaa1111-1111-1111-1111-111111111113"}'::jsonb
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14',
        '22222222-2222-2222-2222-222222222222',
        'listening',
        450,
        4,
        'Part 4: Academic Lecture Monologue (Marine Bioacoustics & Ocean Noise). 10 questions with Original BandBloom Calibrated Audio.',
        '{"part_number": 4, "media_asset_id": "aaaa1111-1111-1111-1111-111111111114"}'::jsonb
    )
ON CONFLICT (id) DO UPDATE SET
    instructions = EXCLUDED.instructions,
    duration_seconds = EXCLUDED.duration_seconds,
    order_index = EXCLUDED.order_index,
    config = EXCLUDED.config;

-- 6. Insert 4 Audio Transcripts with Structured Timestamp Segments (Phase 5)
INSERT INTO audio_transcripts (
    media_asset_id, part_number, title, context, speakers, full_transcript, segments_json, content_version, verification_status, is_synthetic, voice_metadata
)
VALUES
    (
        'aaaa1111-1111-1111-1111-111111111111',
        1,
        'Part 1: Student Accommodation & Tenancy Agreement',
        'Everyday Social Conversation between two speakers',
        'Sarah (Housing Officer) & Liam Patel (International Student)',
        'Sarah: Good morning, City University Student Accommodation Services. My name is Sarah. How can I assist you today?
Liam: Good morning, Sarah. I am an incoming postgraduate student from Canada, and I''d like to finalize my accommodation booking for the upcoming academic year.
Sarah: Welcome to City University! Let me pull up our international tenancy portal. Could I take your full name, please?
Liam: Yes, my first name is Liam, and my surname is Patel. That''s P-A-T-E-L.
Sarah: Thank you, Liam. And what is your student identification number?
Liam: It''s CU-84920.
Sarah: Perfect. Now, regarding your intended move-in date. Our standard semester begins on the 25th of September.
Liam: I was initially hoping to arrive early on the 10th, but my flight departs on the 17th, so I will arrive to move into the flat on the 18th of September.
Sarah: Splendid. The 18th of September is officially registered. Now, which category of accommodation did you request?
Liam: I originally applied for a shared en-suite room in Hall A, but due to my research hours, I decided on a private studio apartment.
Sarah: Excellent. The self-contained studio apartment is located in Victoria Court. The monthly rental is 650 pounds.
Liam: And does that require a security deposit?
Liam: Yes, the refundable security deposit is 800 pounds, payable prior to key collection.
Sarah: Note that high-speed internet and water are fully included in the monthly rent, but electricity is metered separately.
Liam: That sounds reasonable. What about transportation? Is there a public bus stop nearby?
Sarah: Yes, the nearest bus stop is located right outside on Elm Street, approximately two minutes'' walk from the lobby.
Liam: Perfect. Which documents do I need to bring for key collection?
Sarah: You must bring your university acceptance letter and a verified bank statement showing maintenance funds.
Liam: Understood. What is the emergency contact number for the accommodation office?
Sarah: Our 24-hour reception desk number is 07700 900342.
Liam: And finally, what payment method is preferred for the monthly rent?
Sarah: All enrolled students are required to arrange payment via monthly direct debit from a UK bank account.',
        '[{"speaker":"Sarah","startTime":"0:02","endTime":"0:09","text":"Good morning, City University Student Accommodation Services. My name is Sarah. How can I assist you today?"},{"speaker":"Liam","startTime":"0:10","endTime":"0:22","text":"Good morning, Sarah. I am an incoming postgraduate student from Canada, and I''d like to finalize my accommodation booking for the upcoming academic year."},{"speaker":"Sarah","startTime":"0:23","endTime":"0:29","text":"Welcome to City University! Let me pull up our international tenancy portal. Could I take your full name, please?"},{"speaker":"Liam","startTime":"0:30","endTime":"0:37","text":"Yes, my first name is Liam, and my surname is Patel. That''s P-A-T-E-L.","questionRef":"lq-1"},{"speaker":"Sarah","startTime":"0:38","endTime":"0:45","text":"Thank you, Liam. And what is your student identification number?"},{"speaker":"Liam","startTime":"0:46","endTime":"0:52","text":"It''s CU-84920."},{"speaker":"Sarah","startTime":"0:53","endTime":"1:00","text":"Now, regarding your intended move-in date. Our standard semester begins on the 25th of September."},{"speaker":"Liam","startTime":"1:01","endTime":"1:14","text":"I was initially hoping to arrive early on the 10th, but my flight departs on the 17th, so I will arrive to move into the flat on the 18th of September.","questionRef":"lq-2"},{"speaker":"Sarah","startTime":"1:15","endTime":"1:21","text":"Splendid. The 18th of September is officially registered. Now, which category of accommodation did you request?"},{"speaker":"Liam","startTime":"1:22","endTime":"1:32","text":"I originally applied for a shared en-suite room in Hall A, but due to my research hours, I decided on a private studio apartment.","questionRef":"lq-3"},{"speaker":"Sarah","startTime":"1:33","endTime":"1:42","text":"The self-contained studio apartment is located in Victoria Court. The monthly rental is 650 pounds.","questionRef":"lq-4"},{"speaker":"Sarah","startTime":"1:43","endTime":"1:52","text":"The refundable security deposit is 800 pounds, payable prior to key collection.","questionRef":"lq-5"},{"speaker":"Sarah","startTime":"1:53","endTime":"2:02","text":"Note that high-speed internet and water are fully included in the monthly rent, but electricity is metered separately.","questionRef":"lq-6"},{"speaker":"Liam","startTime":"2:03","endTime":"2:10","text":"That sounds reasonable. What about transportation? Is there a public bus stop nearby?"},{"speaker":"Sarah","startTime":"2:11","endTime":"2:20","text":"Yes, the nearest bus stop is located right outside on Elm Street, approximately two minutes'' walk from the lobby.","questionRef":"lq-7"},{"speaker":"Liam","startTime":"2:21","endTime":"2:26","text":"Perfect. Which documents do I need to bring for key collection?"},{"speaker":"Sarah","startTime":"2:27","endTime":"2:36","text":"You must bring your university acceptance letter and a verified bank statement showing maintenance funds.","questionRef":"lq-8"},{"speaker":"Sarah","startTime":"2:37","endTime":"2:46","text":"Our 24-hour reception desk number is 07700 900342.","questionRef":"lq-9"},{"speaker":"Sarah","startTime":"2:47","endTime":"2:58","text":"All enrolled students are required to arrange payment via monthly direct debit from a UK bank account.","questionRef":"lq-10"}]'::jsonb,
        '2026.1',
        'verified',
        true,
        '{"source":"BandBloom Academic Assessment Panel","voice_name":"Microsoft David Desktop","voice_language":"en-US","tts_provider":"BandBloom Calibrated Speech Synthesizer","sha256":"88d1339dfd73a29793d279e26fb927a8df3ab7067325a4960198261b484d7d1e"}'::jsonb
    ),
    (
        'aaaa1111-1111-1111-1111-111111111112',
        2,
        'Part 2: Riverside Sports Centre Orientation & Facilities Tour',
        'Everyday Social Monologue providing practical information',
        'Marcus Vance (Facility Operations Director)',
        'Marcus: Good evening everyone, and a warm welcome to the Riverside Sports and Community Centre. My name is Marcus Henderson, and I am delighted to give you an overview of our freshly renovated facilities.
Before we explore the floor plan, let me touch upon our membership terms. While regular annual adult membership is 300 dollars, verified university students and senior citizens receive an automatic twenty percent discount upon presenting valid photo ID.
Our operational hours have also expanded. From Monday through Friday, our doors open promptly at 6:00 am. However, on Saturdays and Sundays, opening time is shifted to 7:00 am to accommodate weekend facility maintenance.
Now, please direct your attention to the building plan displayed on your handouts. You are currently standing at the Main Entrance facing north. Directly ahead of you through the double turnstiles lies our central reception desk.
If you walk past reception and head straight ahead to the rear of the building, you will enter the Northern Wing, which houses our heated 50-metre Olympic swimming pool.
Now, if you return to reception and look to your left along the West Corridor, the first doorway on your right leads to our newly expanded Fitness Suite and free-weights gym.
Continue further down that West Corridor to the very end, and on your left you will locate the four glass-backed Squash Courts, positioned directly behind the healthy juice bar.
Opposite the squash courts on your right is the Aerobics Studio, where high-intensity interval training and yoga classes take place.
A quick reminder regarding our changing facilities: to secure personal lockers in both changing rooms, members must deposit a two-pound coin or token, which is refunded immediately upon unlocking.
Regarding sporting gear: table tennis bats and badminton racquets are provided completely free of charge at the equipment counter, though members must provide their own shuttlecocks and footwear.
Outside parking is accessible from River Road. Please remember that all vehicles must display a valid parking permit on their dashboard, or pay-and-display fees will apply.
Our on-site Waterside Café serves freshly prepared snacks daily from 8:00 am. We pride ourselves on catering for diverse dietary needs, featuring extensive vegan and gluten-free menus.
Finally, before using any advanced cardiovascular or weight equipment, every member must attend a thirty-minute introductory induction session with a certified personal trainer.',
        '[{"speaker":"Marcus","startTime":"0:02","endTime":"0:12","text":"Good evening everyone, and a warm welcome to the Riverside Sports and Community Centre. My name is Marcus Henderson."},{"speaker":"Marcus","startTime":"0:13","endTime":"0:25","text":"While regular annual adult membership is 300 dollars, verified university students and senior citizens receive an automatic twenty percent discount upon presenting valid photo ID.","questionRef":"lq-11"},{"speaker":"Marcus","startTime":"0:26","endTime":"0:39","text":"From Monday through Friday, our doors open promptly at 6:00 am. However, on Saturdays and Sundays, opening time is shifted to 7:00 am to accommodate weekend facility maintenance.","questionRef":"lq-12"},{"speaker":"Marcus","startTime":"0:40","endTime":"0:52","text":"Directly ahead of you through the double turnstiles lies our central reception desk. If you walk past reception straight to the rear, you will enter the Northern Wing, which houses our heated 50-metre Olympic swimming pool.","questionRef":"lq-13"},{"speaker":"Marcus","startTime":"0:53","endTime":"1:05","text":"If you look to your left along the West Corridor, the first doorway on your right leads to our newly expanded Fitness Suite and free-weights gym.","questionRef":"lq-14"},{"speaker":"Marcus","startTime":"1:06","endTime":"1:18","text":"Continue further down that West Corridor to the very end, and on your left you will locate the four glass-backed Squash Courts, positioned directly behind the healthy juice bar.","questionRef":"lq-15"},{"speaker":"Marcus","startTime":"1:19","endTime":"1:32","text":"To secure personal lockers in both changing rooms, members must deposit a two-pound coin or token, which is refunded immediately upon unlocking.","questionRef":"lq-16"},{"speaker":"Marcus","startTime":"1:33","endTime":"1:44","text":"Regarding sporting gear: table tennis bats and badminton racquets are provided completely free of charge at the equipment counter.","questionRef":"lq-17"},{"speaker":"Marcus","startTime":"1:45","endTime":"1:55","text":"Please remember that all vehicles must display a valid parking permit on their dashboard, or pay-and-display fees will apply.","questionRef":"lq-18"},{"speaker":"Marcus","startTime":"1:56","endTime":"2:08","text":"Our on-site Waterside Café serves freshly prepared snacks daily from 8:00 am. We pride ourselves on catering for diverse dietary needs, featuring extensive vegan and gluten-free menus.","questionRef":"lq-19"},{"speaker":"Marcus","startTime":"2:09","endTime":"2:20","text":"Finally, before using any advanced cardiovascular or weight equipment, every member must attend a thirty-minute introductory induction session with a certified personal trainer.","questionRef":"lq-20"}]'::jsonb,
        '2026.1',
        'verified',
        true,
        '{"source":"BandBloom Academic Assessment Panel","voice_name":"Microsoft David Desktop","voice_language":"en-US","tts_provider":"BandBloom Calibrated Speech Synthesizer","sha256":"bac16e3a67ae25841a470796abdbde4c2e865025d1b9c11239df3933ccca3824"}'::jsonb
    ),
    (
        'aaaa1111-1111-1111-1111-111111111113',
        3,
        'Part 3: Renewable Energy Tutorial — Offshore Wind Turbine Design',
        'Educational & Training Academic Discussion between multiple speakers',
        'Dr. Aris Thorne (Academic Supervisor), Elena Rostova & Toby Jenkins (Engineering Students)',
        'Dr. Evans: Good afternoon, Elena, Jack. Come in and take a seat. Today we need to evaluate your preliminary proposal for the coastal wind turbine telemetry study.
Elena: Thank you, Dr. Evans. As you know, we selected offshore floating turbines rather than onshore arrays because offshore installations experience significantly higher laminar wind speeds and avoid complex terrestrial boundary turbulence.
Jack: That''s right. But during our bench testing last week, we ran into an unexpected obstacle with the acoustic sensor package.
Dr. Evans: Ah, what kind of problem occurred, Jack?
Jack: Well, we anticipated interference from high salt humidity. But in fact, the telemetry module experienced severe signal clipping because the sensor gain was set far too high for coastal gust dynamics.
Dr. Evans: That is a classic mistake in prototype marine sensors. Older telemetry devices had fixed analog attenuators, whereas modern units require manual digital calibration before deployment.
Elena: Exactly. Once Jack adjusted the analog-to-digital converter threshold, the dynamic response smoothed out.
Dr. Evans: Excellent. Now let''s review your data processing pipeline. Looking at your methodology flow-chart, what is your first procedural step after retrieving raw data packets?
Jack: Stage one is hardware telemetry decompression and timestamp synchronization across all three turbine towers.
Elena: Then in stage two, before any analytical modeling, the automated script runs atmospheric pressure logging to calibrate air density variables.
Dr. Evans: Crucial, because wind kinetic energy is directly proportional to air density. And stage three?
Jack: In the third stage, we perform statistical outlier filtering to eliminate transient radio frequency spikes.
Elena: And finally, stage four consists of comparative variance analysis, comparing our field figures against the national grid benchmark database.
Dr. Evans: That is a very coherent methodology. Now, regarding university project requirements: have you both completed the mandatory risk documentation?
Jack: We have drafted the emergency evacuation protocol. But university ethics rules specify that we cannot embark on coastal sea trials without a certified marine safety officer on board the research vessel.
Elena: And Dr. Evans, when is our final milestone draft due?
Dr. Evans: The complete draft chapter must be uploaded to the portal by midnight on the 24th of November.
Jack: And where shall we convene for next week''s supervisory meeting?
Dr. Evans: Next Tuesday we will meet in Room 402 in Science Block B, as this tutorial room is booked for doctoral examinations.',
        '[{"speaker":"Dr. Evans","startTime":"0:02","endTime":"0:12","text":"Good afternoon, Elena, Jack. Come in and take a seat. Today we need to evaluate your preliminary proposal for the coastal wind turbine telemetry study."},{"speaker":"Elena","startTime":"0:13","endTime":"0:25","text":"As you know, we selected offshore floating turbines rather than onshore arrays because offshore installations experience significantly higher laminar wind speeds and avoid complex terrestrial boundary turbulence.","questionRef":"lq-21"},{"speaker":"Jack","startTime":"0:26","endTime":"0:41","text":"We anticipated interference from high salt humidity. But in fact, the telemetry module experienced severe signal clipping because the sensor gain was set far too high for coastal gust dynamics.","questionRef":"lq-22"},{"speaker":"Dr. Evans","startTime":"0:42","endTime":"0:56","text":"That is a classic mistake in prototype marine sensors. Older telemetry devices had fixed analog attenuators, whereas modern units require manual digital calibration before deployment.","questionRef":"lq-23"},{"speaker":"Jack","startTime":"0:57","endTime":"1:08","text":"Stage one is hardware telemetry decompression and timestamp synchronization across all three turbine towers."},{"speaker":"Elena","startTime":"1:09","endTime":"1:21","text":"Then in stage two, before any analytical modeling, the automated script runs atmospheric pressure logging to calibrate air density variables.","questionRef":"lq-24"},{"speaker":"Jack","startTime":"1:22","endTime":"1:33","text":"In the third stage, we perform statistical outlier filtering to eliminate transient radio frequency spikes.","questionRef":"lq-25"},{"speaker":"Elena","startTime":"1:34","endTime":"1:46","text":"And finally, stage four consists of comparative variance analysis, comparing our field figures against the national grid benchmark database.","questionRef":"lq-26"},{"speaker":"Jack","startTime":"1:47","endTime":"2:01","text":"We have drafted the emergency evacuation protocol. But university ethics rules specify that we cannot embark on coastal sea trials without a certified marine safety officer on board the research vessel.","questionRef":"lq-27"},{"speaker":"Dr. Evans","startTime":"2:02","endTime":"2:13","text":"The complete draft chapter must be uploaded to the portal by midnight on the 24th of November.","questionRef":"lq-28"},{"speaker":"Jack","startTime":"2:14","endTime":"2:18","text":"And where shall we convene for next week''s supervisory meeting?"},{"speaker":"Dr. Evans","startTime":"2:19","endTime":"2:28","text":"Next Tuesday we will meet in Room 402 in Science Block B, as this tutorial room is booked for doctoral examinations.","questionRef":"lq-29"},{"speaker":"Elena","startTime":"2:29","endTime":"2:36","text":"Thank you Dr. Evans, we will prepare the calibrated sensor logs and see you in Room 402.","questionRef":"lq-30"}]'::jsonb,
        '2026.1',
        'verified',
        true,
        '{"source":"BandBloom Academic Assessment Panel","voice_name":"Microsoft David Desktop","voice_language":"en-US","tts_provider":"BandBloom Calibrated Speech Synthesizer","sha256":"0e43a9da30f17e56b9d99d4b3a4853fc6e138051fa9a9e4c56eeaffc0280d4f4"}'::jsonb
    ),
    (
        'aaaa1111-1111-1111-1111-111111111114',
        4,
        'Part 4: Marine Bioacoustics and Ocean Anthropogenic Noise',
        'Academic Subject Lecture Monologue on Marine Zoology and Conservation',
        'Professor Catherine Vance (Department of Marine Biology & Acoustic Ecology)',
        'Prof. Thorne: Good morning. Today we continue our examination of sensory adaptations in aquatic mammals by analyzing the bioacoustics of odontocetes—the toothed whales, dolphins, and porpoises.
Unlike terrestrial mammals, whose primary spatial perception relies heavily upon vision, toothed cetaceans have evolved a biosonar system known as echolocation.
This system operates across extraordinary frequency bandwidths, allowing animals to navigate, forage, and detect micro-anatomical prey features in environments of zero ambient light.
To produce ultrasonic clicks, air is forced through specialized pressurized nasal passages containing paired fatty structures termed phonic lips.
Vibrations generated at these phonic lips are not transmitted directly into open water. Instead, the acoustic pulse is propagated into the melon—an elliptical, lipid-rich organ situated in the forehead.
The melon acts as an organic acoustic lens, focusing divergent sound waves into a tight, directional beam projected forward into the ocean column.
When this ultrasonic pulse strikes an organism or submerged obstacle, reflected echoes bounce back toward the cetacean.
Curiously, returning signals are not received primarily through the external ear canals, which are degenerate and sealed with vestigial wax.
Instead, returning acoustic vibrations penetrate the lower jawbone, which is hollow and filled with low-viscosity acoustic lipids that channel vibrations directly to the tympanoperiotic bone of the middle ear.
From here, high-speed neural pathways convey signals to the auditory cortex, enabling the animal to construct a three-dimensional cognitive map of its surroundings.
However, in recent decades, this evolutionary mastery has encountered severe disruption from anthropogenic ocean noise.
Commercial cargo vessels produce continuous low-frequency noise pollution that overlaps with the communicative whistles and foraging clicks of coastal delphinids.
Furthermore, industrial offshore pile-driving during offshore wind turbine construction generates massive acoustic shockwaves capable of causing permanent hearing loss in harbor porpoises.
Even more critical are deep-water naval exercises utilizing active mid-frequency sonar.
Exposure to intense sonar pulses causes beaked whales to panic and execute rapid, panicked vertical ascents, triggering lethal decompression sickness similar to the bends in human scuba divers.
In response to this ecological crisis, several marine sanctuaries have mandated vessel speed restrictions, reducing noise cavitation by up to fifty percent.
Additionally, research consortia are deploying networks of autonomous acoustic buoys to track whale pods in real time, automatically notifying commercial vessels to reroute away from vital migratory corridors.',
        '[{"speaker":"Prof. Thorne","startTime":"0:02","endTime":"0:14","text":"Good morning. Today we continue our examination of sensory adaptations in aquatic mammals by analyzing the bioacoustics of odontocetes—the toothed whales, dolphins, and porpoises."},{"speaker":"Prof. Thorne","startTime":"0:15","endTime":"0:28","text":"To produce ultrasonic clicks, air is forced through specialized pressurized nasal passages containing paired fatty structures termed phonic lips.","questionRef":"lq-31"},{"speaker":"Prof. Thorne","startTime":"0:29","endTime":"0:42","text":"Instead, the acoustic pulse is propagated into the melon—an elliptical, lipid-rich organ situated in the forehead.","questionRef":"lq-32"},{"speaker":"Prof. Thorne","startTime":"0:43","endTime":"0:56","text":"Curiously, returning signals are not received primarily through the external ear canals... instead, returning acoustic vibrations penetrate the lower jawbone.","questionRef":"lq-33"},{"speaker":"Prof. Thorne","startTime":"0:57","endTime":"1:11","text":"From here, high-speed neural pathways convey signals to the auditory cortex, enabling the animal to construct a three-dimensional cognitive map of its surroundings.","questionRef":"lq-34"},{"speaker":"Prof. Thorne","startTime":"1:12","endTime":"1:25","text":"This system operates across extraordinary frequency bandwidths, allowing animals to navigate, forage, and detect prey features in environments of zero ambient light.","questionRef":"lq-35"},{"speaker":"Prof. Thorne","startTime":"1:26","endTime":"1:39","text":"Commercial cargo vessels produce continuous low-frequency noise pollution that overlaps with the communicative whistles and foraging clicks of coastal delphinids.","questionRef":"lq-36"},{"speaker":"Prof. Thorne","startTime":"1:40","endTime":"1:54","text":"Furthermore, industrial offshore pile-driving during offshore wind turbine construction generates massive acoustic shockwaves capable of causing permanent hearing loss in harbor porpoises.","questionRef":"lq-37"},{"speaker":"Prof. Thorne","startTime":"1:55","endTime":"2:09","text":"Even more critical are deep-water naval exercises utilizing active mid-frequency sonar, triggering lethal decompression sickness.","questionRef":"lq-38"},{"speaker":"Prof. Thorne","startTime":"2:10","endTime":"2:23","text":"In response to this ecological crisis, several marine sanctuaries have mandated vessel speed restrictions, reducing noise cavitation by up to fifty percent.","questionRef":"lq-39"},{"speaker":"Prof. Thorne","startTime":"2:24","endTime":"2:38","text":"Additionally, research consortia are deploying networks of autonomous acoustic buoys to track whale pods in real time, automatically notifying commercial vessels to reroute.","questionRef":"lq-40"}]'::jsonb,
        '2026.1',
        'verified',
        true,
        '{"source":"BandBloom Academic Assessment Panel","voice_name":"Microsoft David Desktop","voice_language":"en-US","tts_provider":"BandBloom Calibrated Speech Synthesizer","sha256":"d9aadbc24aaecddb4c3e1d8749c95af0d97fa48ecc4e57021fcca85a845d39a2"}'::jsonb
    )
ON CONFLICT (media_asset_id, part_number) DO UPDATE SET
    title = EXCLUDED.title,
    context = EXCLUDED.context,
    speakers = EXCLUDED.speakers,
    full_transcript = EXCLUDED.full_transcript,
    segments_json = EXCLUDED.segments_json,
    verification_status = EXCLUDED.verification_status,
    voice_metadata = EXCLUDED.voice_metadata,
    updated_at = NOW();

-- 4. Insert 40 Calibrated Listening Questions (Questions 1 to 40)
INSERT INTO questions (
    id, skill, type, module, difficulty, prompt, context_text, explanation, rights_status, status, version, media_asset_id
)
VALUES
    -- Part 1: Questions 1 to 10
    (
        '88888888-8888-8888-8888-888888888901',
        'listening',
        'completion',
        'both',
        'easy',
        'Student Surname: [_____] (First Name: Liam)',
        'Liam explicitly spells his surname: P-A-T-E-L.',
        'Audio timestamp 0:30. Liam spells P-A-T-E-L.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111111'
    ),
    (
        '88888888-8888-8888-8888-888888888902',
        'listening',
        'completion',
        'both',
        'easy',
        'Move-in Date: [_____] September',
        'Liam confirms he will arrive to move in on the 18th of September.',
        'Audio timestamp 1:01. Liam confirms 18th September.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111111'
    ),
    (
        '88888888-8888-8888-8888-888888888903',
        'listening',
        'completion',
        'both',
        'medium',
        'Accommodation Category: [_____]',
        'Liam switched from shared en-suite to a private studio apartment.',
        'Audio timestamp 1:22. Studio apartment.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111111'
    ),
    (
        '88888888-8888-8888-8888-888888888904',
        'listening',
        'completion',
        'both',
        'easy',
        'Monthly Rent: £[_____]',
        'Sarah states the monthly rental is 650 pounds.',
        'Audio timestamp 1:33. Monthly rent is 650.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111111'
    ),
    (
        '88888888-8888-8888-8888-888888888905',
        'listening',
        'completion',
        'both',
        'medium',
        'Refundable Security Deposit: £[_____]',
        'Sarah confirms the deposit is 800 pounds.',
        'Audio timestamp 1:43. Security deposit is 800.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111111'
    ),
    (
        '88888888-8888-8888-8888-888888888906',
        'listening',
        'completion',
        'both',
        'medium',
        'Utilities Included in Rent: Water and [_____]',
        'Sarah confirms internet and water are included; electricity is metered separately.',
        'Audio timestamp 1:53. Internet is included.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111111'
    ),
    (
        '88888888-8888-8888-8888-888888888907',
        'listening',
        'short_answer',
        'both',
        'easy',
        'Name of Nearest Bus Stop: [_____] Street',
        'Sarah indicates the nearest bus stop is on Elm Street.',
        'Audio timestamp 2:11. Elm Street stop.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111111'
    ),
    (
        '88888888-8888-8888-8888-888888888908',
        'listening',
        'short_answer',
        'both',
        'medium',
        'Required Document for Keys: University letter and [_____]',
        'Sarah specifies bringing a verified bank statement.',
        'Audio timestamp 2:27. Bank statement required.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111111'
    ),
    (
        '88888888-8888-8888-8888-888888888909',
        'listening',
        'completion',
        'both',
        'medium',
        '24-Hour Reception Desk Telephone: [_____]',
        'Sarah states the reception desk number is 07700 900342.',
        'Audio timestamp 2:37. Phone number 07700 900342.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111111'
    ),
    (
        '88888888-8888-8888-8888-888888888910',
        'listening',
        'completion',
        'both',
        'medium',
        'Mandatory Payment Method: Monthly [_____]',
        'Sarah confirms payment via direct debit is mandatory.',
        'Audio timestamp 2:47. Direct debit.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111111'
    ),

    -- Part 2: Questions 11 to 20
    (
        '88888888-8888-8888-8888-888888888911',
        'listening',
        'completion',
        'both',
        'easy',
        'Student and Senior Citizen Membership Discount: [_____]%',
        'Marcus announces a 20 percent discount.',
        'Audio timestamp 0:13. 20 percent discount.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111112'
    ),
    (
        '88888888-8888-8888-8888-888888888912',
        'listening',
        'multiple_choice',
        'both',
        'medium',
        'What time does the sports centre open on weekend mornings?',
        'Marcus explains that weekend opening shifts to 7:00 am.',
        'Audio timestamp 0:26. Weekends open at 7:00 am (weekdays 6:00 am).',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111112'
    ),
    (
        '88888888-8888-8888-8888-888888888913',
        'listening',
        'multiple_choice',
        'both',
        'medium',
        'Where is the 50-metre Olympic swimming pool located on the facility plan?',
        'Marcus directs members through reception straight ahead into the Northern Wing.',
        'Audio timestamp 0:40. Northern Wing at the rear.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111112'
    ),
    (
        '88888888-8888-8888-8888-888888888914',
        'listening',
        'completion',
        'both',
        'medium',
        'Fitness Suite location along the West Corridor: First doorway on the [_____]',
        'Marcus notes the doorway to the gym is on the right of the corridor.',
        'Audio timestamp 0:53. First doorway on the right.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111112'
    ),
    (
        '88888888-8888-8888-8888-888888888915',
        'listening',
        'short_answer',
        'both',
        'medium',
        'The squash courts are located directly behind which facility?',
        'Marcus locates the squash courts directly behind the healthy juice bar.',
        'Audio timestamp 1:06. Directly behind the juice bar.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111112'
    ),
    (
        '88888888-8888-8888-8888-888888888916',
        'listening',
        'completion',
        'both',
        'medium',
        'Changing Room Lockers: Require a [_____] deposit (refunded upon unlocking).',
        'Marcus mentions a two-pound coin or token deposit.',
        'Audio timestamp 1:19. Two-pound coin.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111112'
    ),
    (
        '88888888-8888-8888-8888-888888888917',
        'listening',
        'multiple_choice',
        'both',
        'medium',
        'Which sports items are available free of charge at the counter?',
        'Bats and racquets are free; shuttlecocks and footwear must be provided by members.',
        'Audio timestamp 1:33. Table tennis bats & badminton racquets are free.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111112'
    ),
    (
        '88888888-8888-8888-8888-888888888918',
        'listening',
        'completion',
        'both',
        'easy',
        'To avoid penalties, parkers must display a valid [_____] on their vehicle dashboard.',
        'Marcus reminds members to display a parking permit.',
        'Audio timestamp 1:45. Parking permit.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111112'
    ),
    (
        '88888888-8888-8888-8888-888888888919',
        'listening',
        'completion',
        'both',
        'easy',
        'Waterside Café: Special menus provided for [_____] and gluten-free diets.',
        'Marcus mentions extensive vegan and gluten-free menus.',
        'Audio timestamp 1:56. Vegan menu.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111112'
    ),
    (
        '88888888-8888-8888-8888-888888888920',
        'listening',
        'completion',
        'both',
        'easy',
        'Mandatory Gym Induction Duration: [_____] minutes',
        'Marcus specifies a 30-minute introductory induction session.',
        'Audio timestamp 2:09. 30 minutes.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111112'
    ),

    -- Part 3: Questions 21 to 30
    (
        '88888888-8888-8888-8888-888888888921',
        'listening',
        'multiple_choice',
        'both',
        'hard',
        'Why did Elena and Jack choose offshore turbines rather than onshore locations?',
        'Elena highlights higher laminar wind speeds and avoiding terrestrial turbulence.',
        'Audio timestamp 0:13. Higher laminar wind speeds without boundary turbulence.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111113'
    ),
    (
        '88888888-8888-8888-8888-888888888922',
        'listening',
        'multiple_choice',
        'both',
        'hard',
        'What was the actual cause of signal clipping in the telemetry bench test?',
        'Jack explains sensor gain was set far too high for gust dynamics.',
        'Audio timestamp 0:26. Excessively high sensor gain settings.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111113'
    ),
    (
        '88888888-8888-8888-8888-888888888923',
        'listening',
        'multiple_choice',
        'both',
        'medium',
        'According to Dr. Evans, modern marine telemetry sensors require:',
        'Dr. Evans clarifies modern units require manual digital calibration.',
        'Audio timestamp 0:42. Manual digital calibration before deployment.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111113'
    ),
    (
        '88888888-8888-8888-8888-888888888924',
        'listening',
        'completion',
        'both',
        'medium',
        'Methodology Stage 2: Automated [_____] to calibrate air density variables.',
        'Elena states stage 2 runs atmospheric pressure logging.',
        'Audio timestamp 1:09. Pressure logging.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111113'
    ),
    (
        '88888888-8888-8888-8888-888888888925',
        'listening',
        'completion',
        'both',
        'medium',
        'Methodology Stage 3: Perform [_____] to eliminate radio spikes.',
        'Jack notes stage 3 executes statistical outlier filtering.',
        'Audio timestamp 1:22. Outlier filtering.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111113'
    ),
    (
        '88888888-8888-8888-8888-888888888926',
        'listening',
        'completion',
        'both',
        'hard',
        'Methodology Stage 4: Conduct comparative [_____] against national benchmarks.',
        'Elena defines stage 4 as comparative variance analysis.',
        'Audio timestamp 1:34. Variance analysis.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111113'
    ),
    (
        '88888888-8888-8888-8888-888888888927',
        'listening',
        'short_answer',
        'both',
        'medium',
        'Who must accompany the students on board the vessel during coastal trials?',
        'Jack confirms a certified marine safety officer must be on board.',
        'Audio timestamp 1:47. Marine safety officer.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111113'
    ),
    (
        '88888888-8888-8888-8888-888888888928',
        'listening',
        'completion',
        'both',
        'easy',
        'Draft Chapter Submission Deadline: [_____] November',
        'Dr. Evans sets the draft deadline as the 24th of November.',
        'Audio timestamp 2:02. 24th November.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111113'
    ),
    (
        '88888888-8888-8888-8888-888888888929',
        'listening',
        'short_answer',
        'both',
        'easy',
        'Next Tutorial Meeting Room Number: Room [_____]',
        'Dr. Evans moves the meeting to Room 402.',
        'Audio timestamp 2:19. Room 402.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111113'
    ),
    (
        '88888888-8888-8888-8888-888888888930',
        'listening',
        'completion',
        'both',
        'easy',
        'Next Meeting Building: Science Block [_____]',
        'Dr. Evans specifies Science Block B.',
        'Audio timestamp 2:19. Science Block B.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111113'
    ),

    -- Part 4: Questions 31 to 40
    (
        '88888888-8888-8888-8888-888888888931',
        'listening',
        'completion',
        'both',
        'hard',
        'Ultrasonic clicks are generated by forcing pressurized air past the [_____] inside nasal passages.',
        'Prof. Thorne identifies the phonic lips.',
        'Audio timestamp 0:15. Phonic lips.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111114'
    ),
    (
        '88888888-8888-8888-8888-888888888932',
        'listening',
        'completion',
        'both',
        'medium',
        'Acoustic Lens: Divergent sound waves are focused forward by a forehead organ known as the [_____].',
        'Prof. Thorne identifies the lipid-rich melon.',
        'Audio timestamp 0:29. Melon.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111114'
    ),
    (
        '88888888-8888-8888-8888-888888888933',
        'listening',
        'completion',
        'both',
        'medium',
        'Returning acoustic echoes enter through lipid channels located inside the animal''s lower [_____].',
        'Prof. Thorne explains echoes enter through the lower jawbone.',
        'Audio timestamp 0:43. Jawbone.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111114'
    ),
    (
        '88888888-8888-8888-8888-888888888934',
        'listening',
        'completion',
        'both',
        'medium',
        'Signals are relayed from the middle ear directly to the auditory [_____] for spatial cognitive processing.',
        'Prof. Thorne identifies the auditory cortex.',
        'Audio timestamp 0:57. Cortex.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111114'
    ),
    (
        '88888888-8888-8888-8888-888888888935',
        'listening',
        'completion',
        'both',
        'easy',
        'Echolocation allows toothed cetaceans to hunt effectively in conditions of zero ambient [_____].',
        'Prof. Thorne specifies environments of zero ambient light.',
        'Audio timestamp 1:12. Light.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111114'
    ),
    (
        '88888888-8888-8888-8888-888888888936',
        'listening',
        'completion',
        'both',
        'medium',
        'Commercial cargo vessels generate low-frequency [_____] that interferes with delphinid communicative whistles.',
        'Prof. Thorne notes continuous low-frequency noise pollution.',
        'Audio timestamp 1:26. Noise pollution.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111114'
    ),
    (
        '88888888-8888-8888-8888-888888888937',
        'listening',
        'completion',
        'both',
        'medium',
        'Offshore pile-driving produces shockwaves capable of causing permanent [_____] in harbor porpoises.',
        'Prof. Thorne highlights permanent hearing loss.',
        'Audio timestamp 1:40. Hearing loss.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111114'
    ),
    (
        '88888888-8888-8888-8888-888888888938',
        'listening',
        'completion',
        'both',
        'medium',
        'Beaked whales develop decompression sickness when exposed to naval [_____] exercises.',
        'Prof. Thorne connects this to mid-frequency active naval sonar.',
        'Audio timestamp 1:55. Sonar.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111114'
    ),
    (
        '88888888-8888-8888-8888-888888888939',
        'listening',
        'completion',
        'both',
        'easy',
        'Marine sanctuaries have successfully lowered acoustic cavitation by imposing vessel speed [_____].',
        'Prof. Thorne states sanctuaries mandated speed restrictions.',
        'Audio timestamp 2:10. Restrictions.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111114'
    ),
    (
        '88888888-8888-8888-8888-888888888940',
        'listening',
        'completion',
        'both',
        'medium',
        'Real-time whale pod tracking is achieved using autonomous acoustic [_____].',
        'Prof. Thorne describes autonomous acoustic buoys.',
        'Audio timestamp 2:24. Buoys.',
        'owned',
        'published',
        1,
        'aaaa1111-1111-1111-1111-111111111114'
    )
ON CONFLICT (id) DO UPDATE SET
    prompt = EXCLUDED.prompt,
    context_text = EXCLUDED.context_text,
    explanation = EXCLUDED.explanation,
    status = 'published';

-- 5. Insert Question Options for Multiple Choice Questions
INSERT INTO question_options (id, question_id, option_order, option_text, is_correct)
VALUES
    -- Q12 Options
    ('cccc1111-1111-1111-1111-111111111201', '88888888-8888-8888-8888-888888888912', 1, 'A: 6:00 am', false),
    ('cccc1111-1111-1111-1111-111111111202', '88888888-8888-8888-8888-888888888912', 2, 'B: 7:00 am', true),
    ('cccc1111-1111-1111-1111-111111111203', '88888888-8888-8888-8888-888888888912', 3, 'C: 8:00 am', false),

    -- Q13 Options
    ('cccc1111-1111-1111-1111-111111111301', '88888888-8888-8888-8888-888888888913', 1, 'A: Northern Wing at the rear', true),
    ('cccc1111-1111-1111-1111-111111111302', '88888888-8888-8888-8888-888888888913', 2, 'B: First room on the West Corridor', false),
    ('cccc1111-1111-1111-1111-111111111303', '88888888-8888-8888-8888-888888888913', 3, 'C: Directly adjacent to reception turnstiles', false),

    -- Q17 Options
    ('cccc1111-1111-1111-1111-111111111701', '88888888-8888-8888-8888-888888888917', 1, 'A: Table tennis bats & badminton racquets', true),
    ('cccc1111-1111-1111-1111-111111111702', '88888888-8888-8888-8888-888888888917', 2, 'B: Shuttlecocks & court footwear', false),
    ('cccc1111-1111-1111-1111-111111111703', '88888888-8888-8888-8888-888888888917', 3, 'C: Squash balls & gym towels', false),

    -- Q21 Options
    ('cccc1111-1111-1111-1111-111111112101', '88888888-8888-8888-8888-888888888921', 1, 'A: Lower maintenance costs and cheaper anchoring', false),
    ('cccc1111-1111-1111-1111-111111112102', '88888888-8888-8888-8888-888888888921', 2, 'B: Higher laminar wind speeds without terrestrial turbulence', true),
    ('cccc1111-1111-1111-1111-111111112103', '88888888-8888-8888-8888-888888888921', 3, 'C: Closer proximity to coastal power consumption centres', false),

    -- Q22 Options
    ('cccc1111-1111-1111-1111-111111112201', '88888888-8888-8888-8888-888888888922', 1, 'A: Salt humidity corroding copper terminals', false),
    ('cccc1111-1111-1111-1111-111111112202', '88888888-8888-8888-8888-888888888922', 2, 'B: Radio frequency interference from coastal radar', false),
    ('cccc1111-1111-1111-1111-111111112203', '88888888-8888-8888-8888-888888888922', 3, 'C: Excessively high sensor gain settings', true),

    -- Q23 Options
    ('cccc1111-1111-1111-1111-111111112301', '88888888-8888-8888-8888-888888888923', 1, 'A: Manual digital calibration before deployment', true),
    ('cccc1111-1111-1111-1111-111111112302', '88888888-8888-8888-8888-888888888923', 2, 'B: Fixed analog attenuator replacement', false),
    ('cccc1111-1111-1111-1111-111111112303', '88888888-8888-8888-8888-888888888923', 3, 'C: Wireless satellite communication links', false)
ON CONFLICT (id) DO UPDATE SET
    option_text = EXCLUDED.option_text,
    is_correct = EXCLUDED.is_correct;

-- 6. Map Exactly 10 Questions Per Section to the 4 Listening Sections (Phase 1)
DELETE FROM exam_section_questions 
WHERE exam_section_id IN (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb13',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14'
);

INSERT INTO exam_section_questions (exam_section_id, question_id, question_order, allocated_marks)
VALUES
    -- Part 1: Questions 1 to 10
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11', '88888888-8888-8888-8888-888888888901', 1, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11', '88888888-8888-8888-8888-888888888902', 2, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11', '88888888-8888-8888-8888-888888888903', 3, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11', '88888888-8888-8888-8888-888888888904', 4, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11', '88888888-8888-8888-8888-888888888905', 5, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11', '88888888-8888-8888-8888-888888888906', 6, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11', '88888888-8888-8888-8888-888888888907', 7, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11', '88888888-8888-8888-8888-888888888908', 8, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11', '88888888-8888-8888-8888-888888888909', 9, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11', '88888888-8888-8888-8888-888888888910', 10, 1.0),

    -- Part 2: Questions 11 to 20
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12', '88888888-8888-8888-8888-888888888911', 1, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12', '88888888-8888-8888-8888-888888888912', 2, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12', '88888888-8888-8888-8888-888888888913', 3, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12', '88888888-8888-8888-8888-888888888914', 4, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12', '88888888-8888-8888-8888-888888888915', 5, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12', '88888888-8888-8888-8888-888888888916', 6, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12', '88888888-8888-8888-8888-888888888917', 7, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12', '88888888-8888-8888-8888-888888888918', 8, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12', '88888888-8888-8888-8888-888888888919', 9, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12', '88888888-8888-8888-8888-888888888920', 10, 1.0),

    -- Part 3: Questions 21 to 30
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb13', '88888888-8888-8888-8888-888888888921', 1, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb13', '88888888-8888-8888-8888-888888888922', 2, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb13', '88888888-8888-8888-8888-888888888923', 3, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb13', '88888888-8888-8888-8888-888888888924', 4, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb13', '88888888-8888-8888-8888-888888888925', 5, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb13', '88888888-8888-8888-8888-888888888926', 6, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb13', '88888888-8888-8888-8888-888888888927', 7, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb13', '88888888-8888-8888-8888-888888888928', 8, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb13', '88888888-8888-8888-8888-888888888929', 9, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb13', '88888888-8888-8888-8888-888888888930', 10, 1.0),

    -- Part 4: Questions 31 to 40
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14', '88888888-8888-8888-8888-888888888931', 1, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14', '88888888-8888-8888-8888-888888888932', 2, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14', '88888888-8888-8888-8888-888888888933', 3, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14', '88888888-8888-8888-8888-888888888934', 4, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14', '88888888-8888-8888-8888-888888888935', 5, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14', '88888888-8888-8888-8888-888888888936', 6, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14', '88888888-8888-8888-8888-888888888937', 7, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14', '88888888-8888-8888-8888-888888888938', 8, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14', '88888888-8888-8888-8888-888888888939', 9, 1.0),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14', '88888888-8888-8888-8888-888888888940', 10, 1.0)
ON CONFLICT (exam_section_id, question_id) DO UPDATE SET
    question_order = EXCLUDED.question_order,
    allocated_marks = EXCLUDED.allocated_marks;
