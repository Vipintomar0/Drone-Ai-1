class DecisionIntelligence:
    def __init__(self):
        self.mission_active = False

    def process_telemetry(self, telemetry, detections):
        """
        Analyzes telemetry and vision data to make autonomous decisions.
        """
        actions = []
        
        # Example rule: Avoid persons
        for obj in detections:
            if obj['label'] == 'person' and obj['confidence'] > 0.8:
                actions.append({"action": "YAW_AVOID", "context": "Person detected in flight path"})
        
        # Geofencing check (simplified)
        if telemetry.get('alt', 0) > 120:
            actions.append({"action": "DESCEND", "context": "Altitude geofence triggered"})

        return actions

decision_layer = DecisionIntelligence()
