/**
 * SVG Bulk Vectorizer - Conversion Settings Component
 * Based on SVGcode by Google LLC (GPL-2.0)
 * 
 * Provides UI for adjusting Potrace conversion parameters.
 * Adapted from: https://github.com/tomayac/SVGcode
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConversionParams, DEFAULT_PARAMS } from '@/lib/converter';

interface ConversionSettingsProps {
  params: ConversionParams;
  onParamsChange: (params: ConversionParams) => void;
}

export default function ConversionSettings({
  params,
  onParamsChange,
}: ConversionSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleParamChange = (key: keyof ConversionParams, value: any) => {
    onParamsChange({
      ...params,
      [key]: value,
    });
  };

  const handleReset = () => {
    onParamsChange(DEFAULT_PARAMS);
  };

  return (
    <div className="w-full">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="w-full justify-between"
      >
        <span>Advanced Settings</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <Card className="mt-3 p-4 space-y-4">
          {/* Turdsize */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="turdsize" className="text-sm font-medium">
                Turdsize (Noise Filter)
              </Label>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {params.turdsize}
              </span>
            </div>
            <Slider
              id="turdsize"
              min={0}
              max={10}
              step={1}
              value={[params.turdsize]}
              onValueChange={(value) => handleParamChange('turdsize', value[0])}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Higher values remove more noise but may lose detail
            </p>
          </div>

          {/* Alphamax */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="alphamax" className="text-sm font-medium">
                Alphamax (Corner Threshold)
              </Label>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {params.alphamax.toFixed(2)}
              </span>
            </div>
            <Slider
              id="alphamax"
              min={0}
              max={2}
              step={0.1}
              value={[params.alphamax]}
              onValueChange={(value) => handleParamChange('alphamax', value[0])}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Controls corner detection sensitivity
            </p>
          </div>

          {/* Turnpolicy */}
          <div className="space-y-2">
            <Label htmlFor="turnpolicy" className="text-sm font-medium">
              Turn Policy
            </Label>
            <Select
              value={String(params.turnpolicy)}
              onValueChange={(value) => handleParamChange('turnpolicy', Number(value))}
            >
              <SelectTrigger id="turnpolicy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Minority</SelectItem>
                <SelectItem value="1">Majority</SelectItem>
                <SelectItem value="2">Deterministic</SelectItem>
                <SelectItem value="3">Rightmost</SelectItem>
                <SelectItem value="4">Left</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Determines how corners are traced
            </p>
          </div>

          {/* Opttolerance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="opttolerance" className="text-sm font-medium">
                Optimization Tolerance
              </Label>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {params.opttolerance.toFixed(2)}
              </span>
            </div>
            <Slider
              id="opttolerance"
              min={0}
              max={1}
              step={0.05}
              value={[params.opttolerance]}
              onValueChange={(value) => handleParamChange('opttolerance', value[0])}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Higher values produce simpler curves
            </p>
          </div>

          {/* Optimize curves */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="opticurve"
              checked={params.opticurve}
              onCheckedChange={(checked) =>
                handleParamChange('opticurve', checked === true)
              }
            />
            <Label htmlFor="opticurve" className="text-sm font-medium cursor-pointer">
              Optimize Curves
            </Label>
          </div>

          {/* Reset button */}
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="w-full mt-4"
          >
            Reset to Defaults
          </Button>
        </Card>
      )}
    </div>
  );
}
