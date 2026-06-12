<?php

namespace App\Models;

use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    /**
     * Override the save method to prevent updating the 'last_used_at' timestamp.
     * This prevents the database.sqlite file from being modified on every API request,
     * which stops live-server from infinitely reloading the page!
     *
     * @param  array  $options
     * @return bool
     */
    public function save(array $options = [])
    {
        // If the ONLY thing being updated is 'last_used_at', ignore the save completely.
        if ($this->isDirty('last_used_at') && count($this->getDirty()) === 1) {
            return true;
        }

        return parent::save($options);
    }
}
