
      // Set the current attempt based on attempts, current_attempt_id.
      const {attempts, current_attempt_id} = response;
      if (attempts && current_attempt_id)  {
        newState.attempt = attempts.find(attempt => attempt.id === current_attempt_id);
      } else {
        newState.attempt = undefined;
      }

