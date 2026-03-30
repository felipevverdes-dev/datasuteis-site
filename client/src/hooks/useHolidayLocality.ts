import { useEffect, useMemo, useState } from "react";
import { useGeolocation } from "@/contexts/GeolocationContext";
import {
  detectHolidayLocality,
  fetchHolidayMunicipalities,
  fetchHolidayStates,
  type HolidayLocalityResponse,
  type HolidayMunicipalityOption,
  type HolidayStateOption,
} from "@/lib/holiday-service";
import { WidgetApiError } from "@/lib/home-widgets";

function normalizeLocationValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function useHolidayLocality(options: { autoDetect?: boolean } = {}) {
  const {
    location,
    loading: geolocationLoading,
    requestPreciseLocation,
  } = useGeolocation();
  const [stateCode, setStateCode] = useState("");
  const [states, setStates] = useState<HolidayStateOption[]>([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [statesError, setStatesError] = useState("");
  const [municipalities, setMunicipalities] = useState<HolidayMunicipalityOption[]>(
    []
  );
  const [municipalitiesLoading, setMunicipalitiesLoading] = useState(false);
  const [municipalitiesError, setMunicipalitiesError] = useState("");
  const [municipalityInput, setMunicipalityInput] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] =
    useState<HolidayMunicipalityOption | null>(null);
  const [detectedLocality, setDetectedLocality] =
    useState<HolidayLocalityResponse | null>(null);
  const [detecting, setDetecting] = useState(false);

  const selectedState = useMemo(
    () => states.find(item => item.code === stateCode) ?? null,
    [stateCode, states]
  );

  const filteredMunicipalities = useMemo(() => {
    const query = normalizeLocationValue(municipalityInput);
    if (!query) {
      return municipalities;
    }

    return municipalities.filter(item =>
      normalizeLocationValue(item.name).includes(query)
    );
  }, [municipalities, municipalityInput]);

  useEffect(() => {
    let cancelled = false;
    setStatesLoading(true);
    setStatesError("");

    void fetchHolidayStates()
      .then(items => {
        if (!cancelled) {
          setStates(items);
        }
      })
      .catch(error => {
        if (!cancelled) {
          setStates([]);
          setStatesError("Dados locais indisponíveis no momento, tente mais tarde.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setStatesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setMunicipalities([]);
    setMunicipalitiesError("");
    setMunicipalityInput("");
    setSelectedMunicipality(null);

    if (!stateCode) {
      setMunicipalitiesLoading(false);
      return;
    }

    let cancelled = false;
    setMunicipalitiesLoading(true);

    void fetchHolidayMunicipalities(stateCode)
      .then(items => {
        if (!cancelled) {
          setMunicipalities(items);
        }
      })
      .catch(error => {
        if (!cancelled) {
          setMunicipalities([]);
          setMunicipalitiesError("Dados locais indisponíveis no momento, tente mais tarde.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setMunicipalitiesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [stateCode]);

  async function detectLocality(options: { precise?: boolean } = {}) {
    setDetecting(true);

    try {
      const preciseLocation = options.precise
        ? await requestPreciseLocation()
        : null;
      const nextLocation = preciseLocation ?? location;
      const payload = await detectHolidayLocality({
        latitude: nextLocation.lat,
        longitude: nextLocation.lon,
      });

      if (!payload) {
        return;
      }

      setDetectedLocality(payload);
      if (payload.state) {
        setStateCode(payload.state.code);
      }

      if (payload.state && payload.municipality) {
        const items = await fetchHolidayMunicipalities(payload.state.code);
        setMunicipalities(items);
        setSelectedMunicipality(
          items.find(item => item.ibgeCode === payload?.municipality?.ibgeCode) ??
            payload.municipality
        );
        setMunicipalityInput(payload.municipality.name);
      }
    } catch (error) {
      setDetectedLocality({
        countryCode: "BR",
        state: null,
        municipality: null,
        label:
          error instanceof WidgetApiError
            ? error.message
            : "Localizacao indisponivel",
        source: "unavailable",
        isFallback: true,
      });
    } finally {
      setDetecting(false);
    }
  }

  useEffect(() => {
    if (!options.autoDetect) {
      return;
    }

    if (statesLoading || geolocationLoading) {
      return;
    }

    void detectLocality();
  }, [
    geolocationLoading,
    location.lat,
    location.lon,
    options.autoDetect,
    statesLoading,
  ]);

  function selectMunicipality(option: HolidayMunicipalityOption | null) {
    setSelectedMunicipality(option);
    setMunicipalityInput(option?.name ?? "");
  }

  const localityLabel = useMemo(() => {
    const parts = ["Brasil"];
    if (selectedState) {
      parts.push(selectedState.code);
    }
    if (selectedMunicipality) {
      parts.push(selectedMunicipality.name);
    }
    return parts.join(" > ");
  }, [selectedMunicipality, selectedState]);

  return {
    stateCode,
    setStateCode,
    states,
    statesLoading,
    statesError,
    selectedState,
    municipalities,
    municipalitiesLoading,
    municipalitiesError,
    municipalityInput,
    setMunicipalityInput,
    selectedMunicipality,
    selectMunicipality,
    filteredMunicipalities,
    detectedLocality,
    detecting,
    detectLocality,
    localityLabel,
  };
}
